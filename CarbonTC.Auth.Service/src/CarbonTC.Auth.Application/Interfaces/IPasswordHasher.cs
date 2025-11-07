// CarbonTC.Auth.Application/Interfaces/IPasswordHasher.cs
namespace CarbonTC.Auth.Application.Interfaces;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}