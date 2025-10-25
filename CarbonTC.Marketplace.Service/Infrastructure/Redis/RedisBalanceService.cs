using Application.Common.Interfaces;
using StackExchange.Redis;
using System.Globalization;

namespace Infrastructure.Redis
{
    public class RedisBalanceService : IBalanceService
    {
        private readonly IDatabase _db;
        private readonly IWalletServiceClient _walletService;

        public RedisBalanceService(IDatabase db, IWalletServiceClient walletService)
        {
            _db = db;
            _walletService = walletService;
        }

        private string GetBalanceKey(Guid userId) => $"wallet:{userId}";
        private string GetAuctionLockKey(Guid userId, Guid auctionId) => $"wallet:{userId}:auction:{auctionId}";

        public async Task<bool> ReserveBalanceForAuctionAsync(Guid userId, Guid auctionId, decimal newBidAmount)
        {
            var script = @"
                local balance_key = KEYS[1]
                local auction_lock_key = KEYS[2]
                local new_bid_amount = tonumber(ARGV[1])
                
                -- Get current available balance
                local available = redis.call('HGET', balance_key, 'available')
                if not available then
                    return {0, 'Balance not found'}
                end
                available = tonumber(available)
                
                -- Get current locked amount for this auction
                local current_auction_lock = redis.call('GET', auction_lock_key)
                if not current_auction_lock then
                    current_auction_lock = 0
                else
                    current_auction_lock = tonumber(current_auction_lock)
                end
                
                -- Calculate the amount we need to reserve (difference)
                local amount_to_reserve = new_bid_amount - current_auction_lock
                
                -- Check if we have enough available balance
                if available < amount_to_reserve then
                    return {0, 'Insufficient balance'}
                end
                
                -- ATOMIC UPDATE:
                -- 1. Decrease available by the difference
                redis.call('HINCRBYFLOAT', balance_key, 'available', -amount_to_reserve)
                
                -- 2. Increase total locked
                redis.call('HINCRBYFLOAT', balance_key, 'locked', amount_to_reserve)
                
                -- 3. Set the new lock amount for this specific auction
                redis.call('SET', auction_lock_key, new_bid_amount)
                
                -- Set TTL for auction lock (match wallet TTL)
                local wallet_ttl = redis.call('TTL', balance_key)
                if wallet_ttl > 0 then
                    redis.call('EXPIRE', auction_lock_key, wallet_ttl)
                end
                
                return {1, 'Success', new_bid_amount}
            ";

            var balanceKey = GetBalanceKey(userId);
            var auctionLockKey = GetAuctionLockKey(userId, auctionId);

            var result = (RedisResult[])await _db.ScriptEvaluateAsync(
                script,
                keys: new RedisKey[] { balanceKey, auctionLockKey },
                values: new RedisValue[] { newBidAmount.ToString(CultureInfo.InvariantCulture) }
            );

            return (int)result[0] == 1;
        }

        public async Task ReleaseBalanceForAuctionAsync(Guid userId, Guid auctionId)
        {
            var script = @"
                local balance_key = KEYS[1]
                local auction_lock_key = KEYS[2]
                
                -- Get the locked amount for this auction
                local locked_amount = redis.call('GET', auction_lock_key)
                if not locked_amount then
                    return 0  -- Nothing to release
                end
                locked_amount = tonumber(locked_amount)
                
                -- ATOMIC UPDATE:
                -- 1. Increase available
                redis.call('HINCRBYFLOAT', balance_key, 'available', locked_amount)
                
                -- 2. Decrease total locked
                redis.call('HINCRBYFLOAT', balance_key, 'locked', -locked_amount)
                
                -- 3. Delete the auction-specific lock
                redis.call('DEL', auction_lock_key)
                
                return 1
            ";

            var balanceKey = GetBalanceKey(userId);
            var auctionLockKey = GetAuctionLockKey(userId, auctionId);

            await _db.ScriptEvaluateAsync(
                script,
                keys: new RedisKey[] { balanceKey, auctionLockKey },
                values: Array.Empty<RedisValue>()
            );
        }


        public async Task CommitBalanceForAuctionAsync(Guid userId, Guid auctionId)
        {
            var script = @"
                local balance_key = KEYS[1]
                local auction_lock_key = KEYS[2]
                
                local locked_amount = redis.call('GET', auction_lock_key)
                if not locked_amount then
                    return 0
                end
                locked_amount = tonumber(locked_amount)
                
                -- Only decrease locked (money is already gone from available)
                redis.call('HINCRBYFLOAT', balance_key, 'locked', -locked_amount)
                
                -- Delete the auction lock
                redis.call('DEL', auction_lock_key)
                
                return 1
            ";

            var balanceKey = GetBalanceKey(userId);
            var auctionLockKey = GetAuctionLockKey(userId, auctionId);

            await _db.ScriptEvaluateAsync(
                script,
                keys: new RedisKey[] { balanceKey, auctionLockKey },
                values: Array.Empty<RedisValue>()
            );
        }

        public async Task<(decimal available, decimal locked)> GetBalanceAsync(Guid userId)
        {
            var key = GetBalanceKey(userId);
            var entries = await _db.HashGetAllAsync(key);

            if (entries.Length == 0)
                return (0, 0);

            decimal available = 0;
            decimal locked = 0;

            foreach (var entry in entries)
            {
                if (entry.Name == "available")
                    available = decimal.Parse(entry.Value, CultureInfo.InvariantCulture);
                else if (entry.Name == "locked")
                    locked = decimal.Parse(entry.Value, CultureInfo.InvariantCulture);
            }

            return (available, locked);
        }

        public async Task<decimal> GetAuctionLockedAmountAsync(Guid userId, Guid auctionId)
        {
            var key = GetAuctionLockKey(userId, auctionId);
            var value = await _db.StringGetAsync(key);

            if (value.IsNullOrEmpty)
                return 0;

            return decimal.Parse(value, CultureInfo.InvariantCulture);
        }

        public async Task WarmUpBalanceAsync(Guid userId, DateTime? auctionEndTime = null)
        {
            var key = GetBalanceKey(userId);
            if (!await _db.KeyExistsAsync(key))
            {
                var walletDto = await _walletService.GetBanlanceAsync(userId);
                if (walletDto == null) return;

                await _db.HashSetAsync(key, new HashEntry[]
                {
                    new("available", walletDto.Available.ToString(CultureInfo.InvariantCulture)),
                    new("locked", "0")
                });

                var ttl = CalculateTtl(auctionEndTime);
                await _db.KeyExpireAsync(key, ttl);
                return;
            }

            var newTtl = CalculateTtl(auctionEndTime);
            var currentTtl = await _db.KeyTimeToLiveAsync(key);

            if (currentTtl == null || newTtl > currentTtl)
            {
                await _db.KeyExpireAsync(key, newTtl);
            }
        }

        private TimeSpan CalculateTtl(DateTime? auctionEndTime)
        {
            if (!auctionEndTime.HasValue || auctionEndTime <= DateTime.UtcNow)
                return TimeSpan.FromMinutes(10);

            var timeUntilEnd = auctionEndTime.Value - DateTime.UtcNow;
            return timeUntilEnd + TimeSpan.FromMinutes(5);
        }

        public async Task<bool> ReserveBalanceForPurchaseAsync(Guid userId, decimal amountToReserve)
        {
            var script = @"
                local balance_key = KEYS[1]
                local amount_to_reserve = tonumber(ARGV[1])

                local available = redis.call('HGET', balance_key, 'available')
                if not available then
                    return {0, 'Balance not found'}
                end
                available = tonumber(available)

                if available < amount_to_reserve then
                    return {0, 'Insufficient balance'}
                end

                -- ATOMIC UPDATE:
                -- 1. Decrease available
                redis.call('HINCRBYFLOAT', balance_key, 'available', -amount_to_reserve)
                -- 2. Increase total locked
                redis.call('HINCRBYFLOAT', balance_key, 'locked', amount_to_reserve)
                
                return {1, 'Success'}
            ";

            var balanceKey = GetBalanceKey(userId);
            var result = (RedisResult[])await _db.ScriptEvaluateAsync(
                script,
                keys: new RedisKey[] { balanceKey },
                values: new RedisValue[] { amountToReserve.ToString(CultureInfo.InvariantCulture) }
            );

            return (int)result[0] == 1;
        }

        public Task ReleaseBalanceForPurchaseAsync(Guid userId, decimal amountToRelease)
        {
            var script = @"
                local balance_key = KEYS[1]
                local amount_to_release = tonumber(ARGV[1])

                -- ATOMIC UPDATE:
                -- 1. Increase available
                redis.call('HINCRBYFLOAT', balance_key, 'available', amount_to_release)
                -- 2. Decrease total locked
                redis.call('HINCRBYFLOAT', balance_key, 'locked', -amount_to_release)
                
                return 1
            ";

            var balanceKey = GetBalanceKey(userId);
            return _db.ScriptEvaluateAsync(
                script,
                keys: new RedisKey[] { balanceKey },
                values: new RedisValue[] { amountToRelease.ToString(CultureInfo.InvariantCulture) }
            );
        }

        public Task CommitPurchaseAsync(Guid userId, decimal amountToCommit)
        {
            var script = @"
                local balance_key = KEYS[1]
                local amount_to_commit = tonumber(ARGV[1])

                -- ATOMIC UPDATE:
                -- 1. Decrease total locked (money is now gone)
                -- (Available was already decreased by ReserveBalanceForPurchaseAsync)
                redis.call('HINCRBYFLOAT', balance_key, 'locked', -amount_to_commit)
                
                return 1
            ";

            var balanceKey = GetBalanceKey(userId);
            return _db.ScriptEvaluateAsync(
                script,
                keys: new RedisKey[] { balanceKey },
                values: new RedisValue[] { amountToCommit.ToString(CultureInfo.InvariantCulture) }
            );
        }
    }
}
