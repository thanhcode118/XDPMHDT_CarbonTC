// CarbonTC.Auth.Application/Features/Auth/Commands/RegisterUser/RegisterUserHandler.cs

using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Events;
using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RegisterUser;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, AuthResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IMessagePublisher _messagePublisher;
    private readonly ILogger<RegisterUserHandler> _logger;

    public RegisterUserHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IMessagePublisher messagePublisher,
        ILogger<RegisterUserHandler> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _messagePublisher = messagePublisher;
        _logger = logger;
    }

    public async Task<AuthResultDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        try
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
                "CVA" => Guid.Parse("44444444-4444-4444-4444-444444444444"),
                _ => Guid.Parse("22222222-2222-2222-2222-222222222222") // Default: EVOwner
            };

            // 3. Tạo user mới - TẤT CẢ ROLE ĐỀU ACTIVE NGAY
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

            _logger.LogInformation(
                "✅ User registered successfully: {Email}, Role: {Role}, UserId: {UserId}",
                createdUser.Email, request.RoleType, createdUser.Id
            );

            // 4. Tạo JWT tokens
            var accessToken = _tokenService.GenerateAccessToken(createdUser);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.SaveRefreshTokenAsync(createdUser.Id, refreshToken);

            // 5. ✅ PUBLISH MESSAGE TỚI RABBITMQ
            try
            {
                var userCreatedEvent = new UserCreatedEvent(createdUser.Id);

                await _messagePublisher.PublishAsync(
                    exchange: "user_exchange",
                    routingKey: "user.created",
                    message: userCreatedEvent,
                    exchangeType: "topic"
                );

                _logger.LogInformation(
                    "📤 Published user.created event for UserId: {UserId}",
                    createdUser.Id
                );
            }
            catch (Exception ex)
            {
                // ⚠️ Không throw exception nếu publish thất bại
                // User vẫn được tạo thành công
                _logger.LogError(ex,
                    "⚠️ Failed to publish user.created event for UserId: {UserId}. User registration completed but event not sent.",
                    createdUser.Id
                );
            }

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
        catch (InvalidOperationException)
        {
            throw; // Re-throw business logic exceptions
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error during user registration for email: {Email}", request.Email);
            throw;
        }
    }
}