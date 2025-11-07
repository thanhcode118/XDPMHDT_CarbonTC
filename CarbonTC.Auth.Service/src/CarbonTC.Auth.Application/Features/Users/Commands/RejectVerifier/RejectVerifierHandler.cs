// CarbonTC.Auth.Application/Features/Users/Commands/RejectVerifier/RejectVerifierHandler.cs

using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Enums;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.RejectVerifier;

public class RejectVerifierHandler : IRequestHandler<RejectVerifierCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public RejectVerifierHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(RejectVerifierCommand request, CancellationToken cancellationToken)
    {
        // 1. Lấy user
        var user = await _userRepository.GetByIdAsync(request.UserId);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} not found");
        }

        // 2. Kiểm tra role
        if (user.Role?.Name != "Verifier")
        {
            throw new InvalidOperationException("Chỉ có thể từ chối tài khoản Verifier");
        }

        // 3. Kiểm tra status
        if (user.Status != UserStatus.PendingApproval)
        {
            throw new InvalidOperationException($"Tài khoản đang ở trạng thái {user.Status}, không thể từ chối");
        }

        // 4. Reject: Đổi status thành Rejected
        user.Status = UserStatus.Rejected;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return true;
    }
}