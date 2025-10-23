// CarbonTC.Auth.Domain/Enums/UserStatus.cs
namespace CarbonTC.Auth.Domain.Enums;

public enum UserStatus
{
    /// <summary>
    /// Tài khoản chưa kích hoạt
    /// </summary>
    Inactive = 0,

    /// <summary>
    /// Tài khoản đang hoạt động
    /// </summary>
    Active = 1,

    /// <summary>
    /// Tài khoản bị khóa tạm thời
    /// </summary>
    Locked = 2,

    /// <summary>
    /// Đang chờ xác minh email/số điện thoại
    /// </summary>
    PendingVerification = 3,

    /// <summary>
    /// Đang chờ phê duyệt từ Admin (dành cho Verifier)
    /// </summary>
    PendingApproval = 4,

    /// <summary>
    /// Tài khoản bị từ chối (dành cho Verifier)
    /// </summary>
    Rejected = 5
}