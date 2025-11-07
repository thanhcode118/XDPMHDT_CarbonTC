// CarbonTC.Auth.Application/Features/Users/Queries/GetPendingVerifiers/GetPendingVerifiersQuery.cs

using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetPendingVerifiers;

public record GetPendingVerifiersQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<UserProfileDto>>;

// Reuse PagedResult từ GetAllUsersQuery
public record PagedResult<T>(
    List<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages
);