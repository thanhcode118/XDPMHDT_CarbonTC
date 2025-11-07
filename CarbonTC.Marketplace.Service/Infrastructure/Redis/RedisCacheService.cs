using Application.Common.Interfaces;
using StackExchange.Redis;
using System.Text.Json;

namespace Infrastructure.Redis
{
    public class RedisCacheService : ICacheService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _db;

        public RedisCacheService(IConnectionMultiplexer redis)
        {
            _redis = redis;
            _db = _redis.GetDatabase();
        }

        #region String
        public Task SetStringAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var serializedValue = Serialize(value);
            return _db.StringSetAsync(key, serializedValue, expiry);
        }

        public async Task<T?> GetStringAsync<T>(string key)
        {
            var value = await _db.StringGetAsync(key);
            return Deserialize<T>(value);
        }

        public Task<long> IncrementAsync(string key, long value = 1)
        {
            return _db.StringIncrementAsync(key, value);
        }

        public Task<long> DecrementAsync(string key, long value = 1)
        {
            return _db.StringDecrementAsync(key, value);
        }

        public Task<bool> SetStringIfNotExistsAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var serializedValue = Serialize(value);
            return _db.StringSetAsync(key, serializedValue, expiry, When.NotExists);
        }
        #endregion

        #region Hash
        public Task SetHashAsync(string key, string field, string value)
        {
            return _db.HashSetAsync(key, field, value);
        }

        public Task SetHashMultipleAsync(string key, Dictionary<string, string> fields)
        {
            var entries = fields.Select(kvp => new HashEntry(kvp.Key, kvp.Value)).ToArray();
            return _db.HashSetAsync(key, entries);
        }

        public async Task<string?> GetHashAsync(string key, string field)
        {
            var value = await _db.HashGetAsync(key, field);
            return value.HasValue ? value.ToString() : null;
        }

        public async Task<Dictionary<string, string>> GetAllHashAsync(string key)
        {
            var entries = await _db.HashGetAllAsync(key);
            return entries.ToDictionary(
                entry => entry.Name.ToString(),
                entry => entry.Value.ToString()
            );
        }

        public Task HashDeleteFieldAsync(string key, string field)
        {
            return _db.HashDeleteAsync(key, field);
        }

        public Task<long> HashIncrementAsync(string key, string field, long value = 1)
        {
            return _db.HashIncrementAsync(key, field, value);
        }

        public Task<bool> HashFieldExistsAsync(string key, string field)
        {
            return _db.HashExistsAsync(key, field);
        }
        #endregion

        #region List
        public Task ListRightPushAsync(string key, string value)
        {
            return _db.ListRightPushAsync(key, value);
        }

        public Task ListLeftPushAsync(string key, string value)
        {
            return _db.ListLeftPushAsync(key, value);
        }

        public async Task<string?> ListRightPopAsync(string key)
        {
            var value = await _db.ListRightPopAsync(key);
            return value.HasValue ? value.ToString() : null;
        }

        public async Task<string?> ListLeftPopAsync(string key)
        {
            var value = await _db.ListLeftPopAsync(key);
            return value.HasValue ? value.ToString() : null;
        }

        public async Task<string[]> GetListRangeAsync(string key, long start = 0, long stop = -1)
        {
            var values = await _db.ListRangeAsync(key, start, stop);
            return ToStringArray(values);
        }

        public Task<long> GetListLengthAsync(string key)
        {
            return _db.ListLengthAsync(key);
        }
        #endregion

        #region Set
        public Task AddToSetAsync(string key, string value)
        {
            return _db.SetAddAsync(key, value);
        }

        public Task RemoveFromSetAsync(string key, string value)
        {
            return _db.SetRemoveAsync(key, value);
        }

        public Task<bool> IsMemberOfSetAsync(string key, string value)
        {
            return _db.SetContainsAsync(key, value);
        }

        public async Task<string[]> GetAllSetMembersAsync(string key)
        {
            var values = await _db.SetMembersAsync(key);
            return ToStringArray(values);
        }

        public Task<long> GetSetMemberCountAsync(string key)
        {
            return _db.SetLengthAsync(key);
        }
        #endregion

        #region Sorted Set
        public Task SortedSetAddAsync(string key, string member, double score)
        {
            return _db.SortedSetAddAsync(key, member, score);
        }

        public Task SortedSetRemoveAsync(string key, string member)
        {
            return _db.SortedSetRemoveAsync(key, member);
        }

        public Task<double?> SortedSetGetScoreAsync(string key, string member)
        {
            return _db.SortedSetScoreAsync(key, member);
        }

        public async Task<Dictionary<string, double>> SortedSetGetRangeByRankAsync(
            string key, long start = 0, long stop = -1, bool descending = false)
        {
            var order = descending ? Order.Descending : Order.Ascending;
            var entries = await _db.SortedSetRangeByRankWithScoresAsync(key, start, stop, order);
            return entries.ToDictionary(
                entry => entry.Element.ToString(),
                entry => entry.Score
            );
        }
        #endregion

        #region General
        public Task RemoveAsync(string key)
        {
            return _db.KeyDeleteAsync(key);
        }

        public Task<bool> ExistsAsync(string key)
        {
            return _db.KeyExistsAsync(key);
        }

        public Task SetExpiryAsync(string key, TimeSpan expiry)
        {
            return _db.KeyExpireAsync(key, expiry);
        }

        #endregion

        #region Private Helpers

        private string Serialize<T>(T value)
        {
            if (value is string s) return s;
            return JsonSerializer.Serialize(value);
        }

        private T? Deserialize<T>(RedisValue value)
        {
            if (value.IsNullOrEmpty)
            {
                return default;
            }

            if (typeof(T) == typeof(string))
            {
                return (T)(object)value.ToString();
            }

            return JsonSerializer.Deserialize<T>(value!);
        }

        private RedisValue[] ToRedisValues(string[] values)
        {
            return Array.ConvertAll(values, v => (RedisValue)v);
        }

        private string[] ToStringArray(RedisValue[] values)
        {
            return Array.ConvertAll(values, v => v.ToString());
        }

        #endregion

        #region
        public async Task<bool> AcquireLockAsync(string key, string value, TimeSpan expiry)
        {
            return await _db.StringSetAsync(key, value, expiry, When.NotExists);
        }

        public async Task<bool> ReleaseLockAsync(string key, string value)
        {
            var script = @"
                if redis.call('get', KEYS[1]) == ARGV[1] then
                    return redis.call('del', KEYS[1])
                else
                    return 0
                end";
            var result = (int)(long)await _db.ScriptEvaluateAsync(script, new RedisKey[] { key }, new RedisValue[] { value });
            return result == 1;
        }

        #endregion
    }
}
