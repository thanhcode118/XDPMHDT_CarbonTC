// CarbonTC.Auth.Infrastructure/Persistence/AuthDbContextFactory.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CarbonTC.Auth.Infrastructure.Persistence;

public class AuthDbContextFactory : IDesignTimeDbContextFactory<AuthDbContext>
{
    public AuthDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AuthDbContext>();

        // Đường dẫn tới appsettings.json
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "../CarbonTC.Auth.Api");

        var configurationBuilder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

        // Thêm Development config nếu có
        var devSettingsPath = Path.Combine(basePath, "appsettings.Development.json");
        if (File.Exists(devSettingsPath))
        {
            configurationBuilder.AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true);
        }

        var configuration = configurationBuilder.Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        optionsBuilder.UseMySql(
            connectionString,
            ServerVersion.AutoDetect(connectionString),
            mySqlOptions => mySqlOptions.EnableRetryOnFailure()
        );

        return new AuthDbContext(optionsBuilder.Options);
    }
}