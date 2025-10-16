// CarbonTC.Auth.Infrastructure/Repositories/UserRepository.cs

using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Entities;
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

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
    }

    public async Task<User> CreateAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email && !u.IsDeleted);
    }

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
}