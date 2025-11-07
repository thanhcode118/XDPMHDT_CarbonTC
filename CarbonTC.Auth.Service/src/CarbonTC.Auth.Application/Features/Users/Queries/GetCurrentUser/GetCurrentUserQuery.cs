// CarbonTC.Auth.Application/Features/Users/Queries/GetCurrentUser/GetCurrentUserQuery.cs

using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserProfileDto>;