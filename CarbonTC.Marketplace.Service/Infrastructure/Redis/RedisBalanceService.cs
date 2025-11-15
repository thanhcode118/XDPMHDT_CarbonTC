using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Globalization;

namespace Infrastructure.Redis
{
    public class RedisBalanceService : IBalanceService
    {
        private readonly IDatabase _db;
        private readonly IWalletServiceClient _walletService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<RedisBalanceService> _logger;

        public RedisBalanceService(IDatabase db, IWalletServiceClient walletService, ICacheService cacheService, ILogger<RedisBalanceService> logger)
        {
            _db = db;
            _walletService = walletService;
            _cacheService = cacheService;
            _logger = logger;
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

        public async Task<bool> WarmUpBalanceAsync(Guid userId, DateTime? auctionEndTime = null)
        {
            var key = GetBalanceKey(userId);

            if (await _db.KeyExistsAsync(key))
            {
                var newTtl = CalculateTtl(auctionEndTime);
                var currentTtl = await _db.KeyTimeToLiveAsync(key);
                if (currentTtl == null || newTtl > currentTtl)
                {
                    await _db.KeyExpireAsync(key, newTtl);
                }
                return true;
            }

            var lockKey = $"warmup_lock:{userId}";
            var lockValue = Guid.NewGuid().ToString();
            var lockAcquired = await _cacheService.AcquireLockAsync(
                lockKey,
                lockValue,
                TimeSpan.FromSeconds(3));

            if (!lockAcquired)
            {
                await Task.Delay(100); 

                if (await _db.KeyExistsAsync(key))
                    return true;

                _logger.LogWarning("Failed to acquire warmup lock for user {UserId}", userId);
                return false;
            }

            try
            {
                if (await _db.KeyExistsAsync(key))
                    return true;

                var walletDto = await _walletService.GetBalanceAsync();

                if (walletDto == null)
                {
                    _logger.LogError("Wallet not found for user {UserId}", userId);
                    return false;
                }

                await _db.HashSetAsync(key, new HashEntry[]
                {
                    new("available", walletDto.Balance.ToString(CultureInfo.InvariantCulture)),
                    new("locked", "0")
                });

                var ttl = CalculateTtl(auctionEndTime);
                await _db.KeyExpireAsync(key, ttl);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to warm up balance for user {UserId}", userId);
                return false; 
            }
            finally
            {
                await _cacheService.ReleaseLockAsync(lockKey, lockValue);
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

        public async Task<bool> CanWithdrawAsync(Guid userId, decimal amountToWithdraw)
        {
            var balanceKey = GetBalanceKey(userId);

            var balanceExists = await _db.KeyExistsAsync(balanceKey);

            if (!balanceExists)
            {
                _logger.LogInformation(
                    "No active balance in cache for user {UserId}. Allowing withdrawal of {Amount}",
                    userId, amountToWithdraw);
                return true;
            }

            var canWithdraw = await CheckBalanceInRedisAsync(balanceKey, amountToWithdraw);

            if (canWithdraw)
            {
                _logger.LogInformation(
                    "User {UserId} has sufficient available balance to withdraw {Amount}",
                    userId, amountToWithdraw);
                return true;
            }

            _logger.LogWarning(
                "User {UserId} has insufficient available balance to withdraw {Amount}. Has locked funds.",
                userId, amountToWithdraw);
            return false;
        }

        private async Task<bool> CheckBalanceInRedisAsync(string balanceKey, decimal amountToWithdraw)
        {
            var script = @"
                local balance_key = KEYS[1]
                local amount_to_withdraw = tonumber(ARGV[1])
        
                local available = redis.call('HGET', balance_key, 'available')
                local locked = redis.call('HGET', balance_key, 'locked')
        
                if not available then
                    return {0, 'Balance not found'}
                end
        
                available = tonumber(available)
                locked = locked and tonumber(locked) or 0
        
                if available >= amount_to_withdraw then
                    return {1, 'Sufficient', available, locked}
                else
                    return {0, 'Insufficient', available, locked}
                end
            ";

            try
            {
                var result = (RedisResult[])await _db.ScriptEvaluateAsync(
                    script,
                    keys: new RedisKey[] { balanceKey },
                    values: new RedisValue[] { amountToWithdraw.ToString(CultureInfo.InvariantCulture) }
                );

                var success = (int)result[0] == 1;

                if (!success)
                {
                    var available = (double)result[2];
                    var locked = (double)result[3];
                    _logger.LogInformation(
                        "Balance check: Available={Available}, Locked={Locked}, Requested={Requested}",
                        available, locked, amountToWithdraw);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking balance in Redis");
                return false;
            }
        }

        public async Task<bool> UpdateBalanceAfterDepositOrWithdrawAsync(Guid userId, decimal newTotalBalance)
        {
            var script = @"
                local balance_key = KEYS[1]
                local new_total_from_wallet = tonumber(ARGV[1])
        
                -- Kiểm tra xem có cache hay không
                local exists = redis.call('EXISTS', balance_key)
        
                if exists == 0 then
                    -- Chưa có cache, khởi tạo mới (user chưa tham gia đấu giá/mua hàng)
                    redis.call('HSET', balance_key, 'available', new_total_from_wallet)
                    redis.call('HSET', balance_key, 'locked', 0)
                    redis.call('EXPIRE', balance_key, 600) -- 10 phút
                    return {1, 'Initialized', new_total_from_wallet, 0, new_total_from_wallet}
                end
        
                -- Đã có cache, tính toán cẩn thận
                local old_available = redis.call('HGET', balance_key, 'available')
                local locked = redis.call('HGET', balance_key, 'locked')
        
                old_available = tonumber(old_available) or 0
                locked = tonumber(locked) or 0
        
                -- Tính tổng cũ trong cache
                local old_total_in_cache = old_available + locked
        
                -- Tính chênh lệch (nạp thêm hoặc rút đi)
                local difference = new_total_from_wallet - old_total_in_cache
        
                -- Cập nhật available bằng cách cộng/trừ difference
                -- QUAN TRỌNG: Giữ nguyên locked!
                local new_available = old_available + difference
        
                -- Đảm bảo available không âm
                if new_available < 0 then
                    new_available = 0
                end
        
                -- Cập nhật
                redis.call('HSET', balance_key, 'available', new_available)
                -- locked GIỮ NGUYÊN!
        
                return {1, 'Updated', new_available, locked, difference}
            ";

            var balanceKey = GetBalanceKey(userId);

            try
            {
                var result = (RedisResult[])await _db.ScriptEvaluateAsync(
                    script,
                    keys: new RedisKey[] { balanceKey },
                    values: new RedisValue[] { newTotalBalance.ToString(CultureInfo.InvariantCulture) }
                );

                var success = (int)result[0] == 1;
                var action = (string)result[1];
                var newAvailable = (double)result[2];
                var locked = (double)result[3];
                var difference = (double)result[4];

                _logger.LogInformation(
                    "Balance updated for user {UserId}. Action: {Action}, New Total: {Total}, Available: {Available}, Locked: {Locked}, Difference: {Diff}",
                    userId, action, newTotalBalance, newAvailable, locked, difference);

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update balance after deposit/withdraw for user {UserId}", userId);
                return false;
            }
        }
    }
}
