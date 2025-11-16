// CarbonTC.Auth.Application/Events/UserCreatedEvent.cs

namespace CarbonTC.Auth.Application.Events;

/// <summary>
/// Event được publish khi user đăng ký thành công
/// </summary>
public record UserCreatedEvent
{
    /// <summary>
    /// ID của user vừa được tạo
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// Constructor
    /// </summary>
    public UserCreatedEvent(Guid userId)
    {
        UserId = userId;
    }
}