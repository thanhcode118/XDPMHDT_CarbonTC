// CarbonTC.Auth.Application/Features/Auth/Commands/RegisterUser/RegisterUserHandler.cs

using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Entities;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RegisterUser;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, AuthResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IMessagePublisher _messagePublisher;

    public RegisterUserHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IMessagePublisher messagePublisher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _messagePublisher = messagePublisher;
    }

    public async Task<AuthResultDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra email đã tồn tại
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // 2. Xác định Role ID dựa trên RoleType trong request
        Guid roleId = request.RoleType switch
        {
            "EVOwner" => Guid.Parse("22222222-2222-2222-2222-222222222222"),
            "CreditBuyer" => Guid.Parse("33333333-3333-3333-3333-333333333333"),
            "Verifier" => Guid.Parse("44444444-4444-4444-4444-444444444444"),
            _ => Guid.Parse("22222222-2222-2222-2222-222222222222") // Default: EVOwner
        };

        // 3. Xác định trạng thái ban đầu
        var initialStatus = request.RoleType == "Verifier"
            ? Domain.Enums.UserStatus.PendingApproval  // Verifier cần được duyệt
            : Domain.Enums.UserStatus.Active;           // Các role khác active ngay

        // 4. Tạo user mới
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Status = initialStatus,
            RoleId = roleId
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // 5. Tạo tokens (chỉ nếu Active)
        string accessToken = string.Empty;
        string refreshToken = string.Empty;

        if (initialStatus == Domain.Enums.UserStatus.Active)
        {
            accessToken = _tokenService.GenerateAccessToken(createdUser);
            refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.SaveRefreshTokenAsync(createdUser.Id, refreshToken);
        }

        // 6. Publish event đến RabbitMQ
        await _messagePublisher.PublishAsync("user.events", "user.registered", new
        {
            UserId = createdUser.Id,
            Email = createdUser.Email,
            FullName = createdUser.FullName,
            RoleType = request.RoleType,
            Status = initialStatus.ToString(),
            RegisteredAt = DateTime.UtcNow
        });

        // 7. Trả về kết quả
        return new AuthResultDto(
            accessToken,
            refreshToken,
            new UserDto(
                createdUser.Id,
                createdUser.Email,
                createdUser.FullName,
                createdUser.PhoneNumber,
                createdUser.Status.ToString(),
                createdUser.Role?.Name
            )
        );
    }
}