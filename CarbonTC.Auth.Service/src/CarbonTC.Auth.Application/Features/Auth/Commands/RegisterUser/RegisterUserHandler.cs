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

        // 2. Xác định Role ID dựa trên RoleType
        Guid roleId = request.RoleType switch
        {
            "Admin" => Guid.Parse("11111111-1111-1111-1111-111111111111"),
            "EVOwner" => Guid.Parse("22222222-2222-2222-2222-222222222222"),
            "CreditBuyer" => Guid.Parse("33333333-3333-3333-3333-333333333333"),
            "Verifier" => Guid.Parse("44444444-4444-4444-4444-444444444444"),
            _ => Guid.Parse("22222222-2222-2222-2222-222222222222") // Default: EVOwner
        };

        // ✅ 3. TẤT CẢ ROLE ĐỀU ACTIVE NGAY - KHÔNG CÓ PENDING
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Status = Domain.Enums.UserStatus.Active, // ✅ MỌI ROLE ĐỀU ACTIVE
            RoleId = roleId
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // ✅ 4. TẠO TOKEN NGAY CHO TẤT CẢ ROLE
        var accessToken = _tokenService.GenerateAccessToken(createdUser);
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SaveRefreshTokenAsync(createdUser.Id, refreshToken);

        // 5. Publish event đến RabbitMQ
        await _messagePublisher.PublishAsync("user.events", "user.registered", new
        {
            UserId = createdUser.Id,
            Email = createdUser.Email,
            FullName = createdUser.FullName,
            RoleType = request.RoleType,
            Status = createdUser.Status.ToString(),
            RegisteredAt = DateTime.UtcNow
        });

        // 6. Trả về kết quả
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