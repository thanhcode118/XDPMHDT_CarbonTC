// CarbonTC.Auth.Application/Features/Users/Queries/GetAllUsers/GetAllUsersHandler.cs

using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Interfaces;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetAllUsers;

public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserProfileDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedResult<UserProfileDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var (users, totalCount) = await _userRepository.GetAllAsync(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm
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