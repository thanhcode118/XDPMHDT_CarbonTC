namespace Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string Email { get; }
        string Username { get; }
        List<string> Roles { get; }
        bool IsAuthenticated { get; }
        bool IsInRole(string role);
        bool HasAnyRole(params string[] roles);
        string GetClaimValue(string claimType);
    }
}
