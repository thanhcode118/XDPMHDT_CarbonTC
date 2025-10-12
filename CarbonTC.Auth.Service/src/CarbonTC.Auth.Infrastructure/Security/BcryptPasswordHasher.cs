// CarbonTC.Auth.Infrastructure/Security/BcryptPasswordHasher.cs
using CarbonTC.Auth.Application.Interfaces;

namespace CarbonTC.Auth.Infrastructure.Security;

public class BcryptPasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}