// CarbonTC.Auth.Domain/Entities/Role.cs
using CarbonTC.Auth.Domain.Common;

namespace CarbonTC.Auth.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Admin, User, Manager
    public string? Description { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
}