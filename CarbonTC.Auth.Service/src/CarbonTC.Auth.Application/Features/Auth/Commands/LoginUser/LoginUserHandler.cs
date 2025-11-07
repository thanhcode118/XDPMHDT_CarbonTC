// CarbonTC.Auth.Application/Features/Auth/Commands/LoginUser/LoginUserHandler.cs
using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Interfaces;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.LoginUser;

public class LoginUserHandler : IRequestHandler<LoginUserCommand, AuthResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public LoginUserHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResultDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm user theo email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // 2. Xác thực mật khẩu
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // 3. Kiểm tra trạng thái user
        if (user.Status != Domain.Enums.UserStatus.Active)
        {
            throw new UnauthorizedAccessException("Account is not active");
        }

        // 4. Tạo tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken);

        // 5. Trả về kết quả
        return new AuthResultDto(
            accessToken,
            refreshToken,
            new UserDto(
                user.Id,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.Status.ToString(),
                user.Role?.Name
            )
        );
    }
}