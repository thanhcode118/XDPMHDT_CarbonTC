// CarbonTC.Auth.Domain/Enums/UserStatus.cs
namespace CarbonTC.Auth.Domain.Enums;

public enum UserStatus
{
    Inactive = 0,
    Active = 1,
    Locked = 2,
    PendingVerification = 3
}