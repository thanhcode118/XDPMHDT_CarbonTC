using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    public interface ICacheService
    {
        #region String

        Task SetStringAsync<T>(string key, T value, TimeSpan? expiry = null);
        Task<T?> GetStringAsync<T>(string key);
        Task<long> IncrementAsync(string key, long value = 1);
        Task<long> DecrementAsync(string key, long value = 1);
        Task<bool> SetStringIfNotExistsAsync<T>(string key, T value, TimeSpan? expiry = null);

        #endregion

        #region Hash

        Task SetHashAsync(string key, string field, string value);
        Task SetHashMultipleAsync(string key, Dictionary<string, string> fields);
        Task<string?> GetHashAsync(string key, string field);
        Task<Dictionary<string, string>> GetAllHashAsync(string key);
        Task HashDeleteFieldAsync(string key, string field);
        Task<long> HashIncrementAsync(string key, string field, long value = 1);
        Task<bool> HashFieldExistsAsync(string key, string field);

        #endregion

        #region Set
        Task AddToSetAsync(string key, string value);
        Task RemoveFromSetAsync(string key, string value);
        Task<bool> IsMemberOfSetAsync(string key, string value);
        Task<string[]> GetAllSetMembersAsync(string key);
        Task<long> GetSetMemberCountAsync(string key);

        #endregion

        #region List
        Task ListRightPushAsync(string key, string value);
        Task ListLeftPushAsync(string key, string value);
        Task<string?> ListRightPopAsync(string key);
        Task<string?> ListLeftPopAsync(string key);
        Task<string[]> GetListRangeAsync(string key, long start = 0, long stop = -1);
        Task<long> GetListLengthAsync(string key);

        #endregion

        #region Sorted Sets

        Task SortedSetAddAsync(string key, string member, double score);
        Task SortedSetRemoveAsync(string key, string member);
        Task<double?> SortedSetGetScoreAsync(string key, string member);
        Task<Dictionary<string, double>> SortedSetGetRangeByRankAsync(
            string key,
            long start = 0,
            long stop = -1,
            bool descending = false);

        #endregion

        #region Locks

        Task<bool> AcquireLockAsync(string key, string value, TimeSpan expiry);
        Task<bool> ReleaseLockAsync(string key, string value);


        #endregion

        #region General

        Task RemoveAsync(string key);
        Task<bool> ExistsAsync(string key);
        Task SetExpiryAsync(string key, TimeSpan expiry);
        

        #endregion
    }
}
