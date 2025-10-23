// CarbonTC.Auth.Application/Features/Users/Queries/GetPendingVerifiers/GetPendingVerifiersHandler.cs

using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Interfaces;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetPendingVerifiers;

public class GetPendingVerifiersHandler : IRequestHandler<GetPendingVerifiersQuery, PagedResult<UserProfileDto>>
{
    private readonly IUserRepository _userRepository;

    public GetPendingVerifiersHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedResult<UserProfileDto>> Handle(
        GetPendingVerifiersQuery request,
        CancellationToken cancellationToken)
    {
        // Lấy danh sách Verifier đang chờ duyệt
        var (users, totalCount) = await _userRepository.GetPendingVerifiersAsync(
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