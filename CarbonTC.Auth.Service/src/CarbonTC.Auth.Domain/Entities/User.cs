// CarbonTC.Auth.Domain/Entities/User.cs
using CarbonTC.Auth.Domain.Common;
using CarbonTC.Auth.Domain.Enums;

namespace CarbonTC.Auth.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public Guid? RoleId { get; set; }
    public Role? Role { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}