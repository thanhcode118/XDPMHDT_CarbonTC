using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace CarbonTC.API.Extensions
{
    public static class AuthenticationServiceExtensions
    {
        public static IServiceCollection AddAuthenticationAndAuthorization(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Lấy secret key từ configuration
            var secretKey = configuration["Jwt:Key"] ?? configuration["Jwt:SecretKey"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT Key not found in configuration!");
            }

            var issuer = configuration["Jwt:Issuer"];
            var audience = configuration["Jwt:Audience"];

            // Tạo signing key
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                // Lấy giá trị đơn
                var issuer = configuration["Jwt:Issuer"];
                var audience = configuration["Jwt:Audience"];

                // Lấy danh sách (arrays) từ appsettings
                var allowedIssuers = configuration.GetSection("Jwt:AllowedIssuers").Get<string[]>();
                var allowedAudiences = configuration.GetSection("Jwt:AllowedAudiences").Get<string[]>();

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,

                    ValidateIssuer = true,        
                    ValidateAudience = true,      
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,

                    ValidIssuer = issuer,                     
                    ValidIssuers = allowedIssuers,            
                    ValidAudience = audience,                 
                    ValidAudiences = allowedAudiences         
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Query.TryGetValue("access_token", out var token))
                        {
                            context.Token = token;
                        }
                        else
                        {
                            var authHeader = context.Request.Headers["Authorization"].ToString();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                            {
                                context.Token = authHeader.Substring("Bearer ".Length).Trim();
                            }
                        }
                        return Task.CompletedTask;
                    },

                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },

                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token validated successfully");
                        return Task.CompletedTask;
                    }
                };
            });

            // Cấu hình Authorization cơ bản
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
                options.AddPolicy("User", policy => policy.RequireRole("User", "Manager", "Admin"));
                options.AddPolicy("EmailVerified", policy => policy.RequireClaim("email_verified", "true"));
            });

            return services;
        }
    }
}