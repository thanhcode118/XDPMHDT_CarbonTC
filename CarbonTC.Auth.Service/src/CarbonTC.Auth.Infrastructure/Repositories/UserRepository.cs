// CarbonTC.Auth.Infrastructure/Repositories/UserRepository.cs

using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Entities;
using CarbonTC.Auth.Domain.Enums;
using CarbonTC.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CarbonTC.Auth.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AuthDbContext _context;

    public UserRepository(AuthDbContext context)
    {
        _context = context;
    }

    #region Basic CRUD Operations

    /// <summary>
    /// Lấy user theo email
    /// </summary>
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
    }

    /// <summary>
    /// Lấy user theo ID
    /// </summary>
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
    }

    /// <summary>
    /// Tạo user mới
    /// </summary>
    public async Task<User> CreateAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    /// <summary>
    /// Cập nhật thông tin user
    /// </summary>
    public async Task UpdateAsync(User user)
    {
        try
        {
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);

            var rowsAffected = await _context.SaveChangesAsync();

            Console.WriteLine($"[UserRepository.UpdateAsync] Rows affected: {rowsAffected}");
            Console.WriteLine($"[UserRepository.UpdateAsync] Updated user: {user.Email}, Status: {user.Status}");

            if (rowsAffected == 0)
            {
                throw new InvalidOperationException("No rows were updated in the database");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserRepository.UpdateAsync] Error: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Kiểm tra email đã tồn tại chưa
    /// </summary>
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email && !u.IsDeleted);
    }

    #endregion

    #region Query Operations

    /// <summary>
    /// Lấy danh sách tất cả user với phân trang và tìm kiếm
    /// </summary>
    public async Task<(List<User> Users, int TotalCount)> GetAllAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u =>
                u.Email.Contains(searchTerm) ||
                u.FullName.Contains(searchTerm) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(searchTerm))
            );
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    /// <summary>
    /// Lấy danh sách Verifier đang chờ phê duyệt
    /// </summary>
    public async Task<(List<User> Users, int TotalCount)> GetPendingVerifiersAsync(
        int pageNumber,
        int pageSize)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted
                && u.Role!.Name == "Verifier"
                && u.Status == UserStatus.PendingApproval)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.CreatedAt) // Sắp xếp theo thời gian đăng ký (cũ nhất trước)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    #endregion

    #region Role-Specific Queries (Optional - For Future Use)

    /// <summary>
    /// Lấy danh sách user theo role
    /// </summary>
    public async Task<(List<User> Users, int TotalCount)> GetByRoleAsync(
        string roleName,
        int pageNumber,
        int pageSize)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted && u.Role!.Name == roleName)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    /// <summary>
    /// Lấy danh sách user theo status
    /// </summary>
    public async Task<(List<User> Users, int TotalCount)> GetByStatusAsync(
        UserStatus status,
        int pageNumber,
        int pageSize)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted && u.Status == status)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    #endregion

    #region Statistics (Optional - For Admin Dashboard)

    /// <summary>
    /// Đếm số lượng user theo role
    /// </summary>
    public async Task<Dictionary<string, int>> GetUserCountByRoleAsync()
    {
        return await _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .GroupBy(u => u.Role!.Name)
            .Select(g => new { Role = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Role, x => x.Count);
    }

    /// <summary>
    /// Đếm số lượng user theo status
    /// </summary>
    public async Task<Dictionary<UserStatus, int>> GetUserCountByStatusAsync()
    {
        return await _context.Users
            .Where(u => !u.IsDeleted)
            .GroupBy(u => u.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);
    }

    /// <summary>
    /// Đếm tổng số user
    /// </summary>
    public async Task<int> GetTotalUserCountAsync()
    {
        return await _context.Users.CountAsync(u => !u.IsDeleted);
    }

    /// <summary>
    /// Đếm số Verifier chờ duyệt
    /// </summary>
    public async Task<int> GetPendingVerifierCountAsync()
    {
        return await _context.Users
            .CountAsync(u => !u.IsDeleted
                && u.Role!.Name == "Verifier"
                && u.Status == UserStatus.PendingApproval);
    }

    #endregion

    #region Advanced Queries (Optional)

    /// <summary>
    /// Tìm kiếm user nâng cao
    /// </summary>
    public async Task<(List<User> Users, int TotalCount)> SearchUsersAsync(
        string? searchTerm,
        string? role,
        UserStatus? status,
        int pageNumber,
        int pageSize)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .AsQueryable();

        // Search term filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u =>
                u.Email.Contains(searchTerm) ||
                u.FullName.Contains(searchTerm) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(searchTerm))
            );
        }

        // Role filter
        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => u.Role!.Name == role);
        }

        // Status filter
        if (status.HasValue)
        {
            query = query.Where(u => u.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    /// <summary>
    /// Lấy user đăng ký gần đây
    /// </summary>
    public async Task<List<User>> GetRecentUsersAsync(int count = 10)
    {
        return await _context.Users
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderByDescending(u => u.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    #endregion
}