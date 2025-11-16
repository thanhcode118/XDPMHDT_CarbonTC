// CarbonTC.Auth.Application/Features/Users/Queries/GetPendingCVAs/GetPendingCVAsHandler.cs

using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Interfaces;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetPendingCVAs;

public class GetPendingCVAsHandler : IRequestHandler<GetPendingCVAsQuery, PagedResult<UserProfileDto>>
{
    private readonly IUserRepository _userRepository;

    public GetPendingCVAsHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedResult<UserProfileDto>> Handle(
        GetPendingCVAsQuery request,
        CancellationToken cancellationToken)
    {
        // Lấy danh sách CVA đang chờ duyệt
        var (users, totalCount) = await _userRepository.GetPendingCVAsAsync(
            request.PageNumber,
            request.PageSize
        );

        var userDtos = users.Select(u => new UserProfileDto(
            u.Id,
            u.Email,
            u.FullName,
            u.PhoneNumber,
            u.Status.ToString(),
            u.Role?.Name,
            u.CreatedAt,
            u.UpdatedAt
        )).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return new PagedResult<UserProfileDto>(
            userDtos,
            request.PageNumber,
            request.PageSize,
            totalCount,
            totalPages
        );
    }
}