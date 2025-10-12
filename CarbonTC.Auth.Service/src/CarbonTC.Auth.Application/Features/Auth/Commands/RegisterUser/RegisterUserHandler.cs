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

        // 2. Tạo user mới
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Status = Domain.Enums.UserStatus.Active,
            RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222") // ← Auto Role "User"

        };

        var createdUser = await _userRepository.CreateAsync(user);

        // 3. Tạo tokens
        var accessToken = _tokenService.GenerateAccessToken(createdUser);
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SaveRefreshTokenAsync(createdUser.Id, refreshToken);

        // 4. Publish event đến RabbitMQ
        await _messagePublisher.PublishAsync("user.events", "user.registered", new
        {
            UserId = createdUser.Id,
            Email = createdUser.Email,
            FullName = createdUser.FullName,
            RegisteredAt = DateTime.UtcNow
        });

        // 5. Trả về kết quả
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