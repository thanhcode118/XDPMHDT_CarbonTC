// CarbonTC.Auth.Application/Features/Users/Queries/GetUserById/GetUserByIdQuery.cs

using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Queries.GetUserById;

public record GetUserByIdQuery(Guid UserId) : IRequest<UserProfileDto>;