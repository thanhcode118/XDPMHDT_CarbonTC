// CarbonTC.Auth.Api/Program.cs

using System.Text;
using CarbonTC.Auth.Api.Middleware;
using CarbonTC.Auth.Application;
using CarbonTC.Auth.Application.Behaviors;
using CarbonTC.Auth.Infrastructure;
using CarbonTC.Auth.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ===== CONTROLLERS & API =====
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ===== SWAGGER WITH JWT =====
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CarbonTC Auth API",
        Version = "v1",
        Description = "Authentication & User Management API",
        Contact = new OpenApiContact
        {
            Name = "CarbonTC Team",
            Email = "support@carbontc.com"
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \n\n" +
                      "Enter 'Bearer' [space] and then your token in the text input below.\n\n" +
                      "Example: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ===== JWT AUTHENTICATION =====
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero, // Không cho phép clock skew
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)
        )
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers.Append("Token-Expired", "true"); // ✅ Dùng Append
            }
            return Task.CompletedTask;
        }
    };
});

// ===== AUTHORIZATION POLICIES =====
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("RequireUserRole", policy =>
        policy.RequireRole("User", "Admin"));
});

// ===== FLUENTVALIDATION =====
builder.Services.AddValidatorsFromAssembly(
    typeof(CarbonTC.Auth.Application.AssemblyReference).Assembly
);

// ===== MEDIATR WITH VALIDATION BEHAVIOR =====
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(
        typeof(CarbonTC.Auth.Application.AssemblyReference).Assembly
    );

    // Thêm ValidationBehavior vào pipeline
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});

// ===== APPLICATION & INFRASTRUCTURE LAYERS =====
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ===== BUILD APP =====
var app = builder.Build();

// ===== AUTO MIGRATE DATABASE =====
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration failed: {ex.Message}");
        throw;
    }
}

// ===== CONFIGURE HTTP REQUEST PIPELINE =====

// Exception Handling Middleware (PHẢI ĐẶT ĐẦU TIÊN)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CarbonTC Auth API v1");
        c.RoutePrefix = "swagger";
    });
}

// CORS
app.UseCors("AllowAll");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Health Check Endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
}))
.WithTags("Health")
.WithOpenApi();

// Start Application
Console.WriteLine("🚀 CarbonTC Auth API is starting...");
Console.WriteLine($"📍 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"🌐 Listening on: http://localhost:5183");
Console.WriteLine($"📚 Swagger UI: http://localhost:5183/swagger");

app.Run();