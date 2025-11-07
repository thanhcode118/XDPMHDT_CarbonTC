// CarbonTC.Auth.Application/Features/Users/Queries/GetAllUsers/GetAllUsersQuery.cs

using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetAllUsers;

public record GetAllUsersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null
) : IRequest<PagedResult<UserProfileDto>>;

public record PagedResult<T>(
    List<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages
);