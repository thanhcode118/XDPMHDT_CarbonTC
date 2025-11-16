// CarbonTC.Auth.Application/Features/Users/Commands/ApproveCVA/ApproveCVAHandler.cs

using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Enums;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.ApproveCVA;

public class ApproveCVAHandler : IRequestHandler<ApproveCVACommand, bool>
{
    private readonly IUserRepository _userRepository;

    public ApproveCVAHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ApproveCVACommand request, CancellationToken cancellationToken)
    {
        // 1. Lấy user
        var user = await _userRepository.GetByIdAsync(request.UserId);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} not found");
        }

        // 2. Kiểm tra role
        if (user.Role?.Name != "CVA")
        {
            throw new InvalidOperationException("Chỉ có thể phê duyệt tài khoản CVA");
        }

        // 3. Kiểm tra status
        if (user.Status != UserStatus.PendingApproval)
        {
            throw new InvalidOperationException($"Tài khoản đang ở trạng thái {user.Status}, không thể phê duyệt");
        }

        // 4. Approve: Đổi status thành Active
        user.Status = UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return true;
    }
}