// CarbonTC.Auth.Application/Interfaces/IUserRepository.cs

using CarbonTC.Auth.Domain.Entities;

namespace CarbonTC.Auth.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
    Task<(List<User> Users, int TotalCount)> GetAllAsync(int pageNumber, int pageSize, string? searchTerm);

    // ✅ THÊM METHOD MỚI
    Task<(List<User> Users, int TotalCount)> GetPendingCVAsAsync(int pageNumber, int pageSize);
}