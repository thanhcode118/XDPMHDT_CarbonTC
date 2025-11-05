using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application;
using CarbonTC.CarbonLifecycle.Application.Abstractions;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Services;
using CarbonTC.CarbonLifecycle.Infrastructure;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using CarbonTC.CarbonLifecycle.Infrastructure.Services.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Serilog;
using CarbonTC.CarbonLifecycle.Api.Extensions;
using CarbonTC.CarbonLifecycle.Api.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CarbonTC.CarbonLifecycle.Api.Services;
using CarbonTC.CarbonLifecycle.Application.Services;


public class Program
{
    public static async Task<int> Main(string[] args)
    {
        // ===== 1. CẤU HÌNH SERILOG (LOGGING) =====
        Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()
            .WriteTo.File("logs/carbonlifecycle-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        try
        {
            Log.Information("Starting Carbon Lifecycle Service...");

            var builder = WebApplication.CreateBuilder(args);

            // ===== 2. SỬ DỤNG SERILOG CHO LOGGING =====
            builder.Host.UseSerilog();

            var appAssembly = typeof(AssemblyReference).Assembly;

            // ===== 3. THÊM CÁC SERVICES VÀO CONTAINER =====
            builder.Services.AddControllers();

            // === ĐĂNG KÝ DỊCH VỤ IIdentityService ===
            builder.Services.AddHttpContextAccessor(); // Cần thiết để đọc HttpContext trong service
            builder.Services.AddScoped<IIdentityService, CurrentUserService>();


            // === CẤU HÌNH AUTHENTICATION (JWT) ===
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
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidAudience = builder.Configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]))
                };
            });

            // === CẤU HÌNH AUTHORIZATION (POLICY) ===
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("IsEVOwner", policy => policy.RequireRole("EVOwner"));
                options.AddPolicy("IsCVA", policy => policy.RequireRole("CVA"));
                // Thêm các policy khác nếu cần (ví dụ: "IsBuyer")
            });

            builder.Services.AddEndpointsApiExplorer();

            // ======================================================================
            // === CẤU HÌNH SWAGGER (ĐÃ GỘP 2 KHỐI CỦA BẠN LẠI LÀM MỘT) ===
            // ======================================================================
            builder.Services.AddSwaggerGen(options =>
            {
                // A. Cấu hình thông tin chung (từ lần gọi thứ 2 của bạn)
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Carbon Lifecycle Service API",
                    Version = "v1",
                    Description = "API cho dịch vụ quản lý vòng đời tín chỉ carbon cho chủ sở hữu xe điện.",
                    Contact = new OpenApiContact
                    {
                        Name = "CarbonTC Team",
                        Email = "contact@carbontc.com",
                        Url = new Uri("https://carbontc.com"),
                    },
                    License = new OpenApiLicense
                    {
                        Name = "Use under MIT",
                        Url = new Uri("https://opensource.org/licenses/MIT"),
                    }
                });

                // B. Cấu hình XML Comments (từ lần gọi thứ 2 của bạn)
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath);
                }

                // C. Cấu hình "Authorize" (từ lần gọi thứ 1 của bạn)
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Description = "Nhập JWT Bearer token của bạn (ví dụ: 'Bearer eyJhbGci...')",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
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
                        new string[] {}
                    }
                });
            });


            // Đăng ký Infrastructure Layer
            builder.Services.AddInfrastructure(builder.Configuration);

            // Đăng ký API Layer 
            builder.Services.AddApiLayer();

            // Cấu hình CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Đăng ký các dịch vụ domain
            builder.Services.AddScoped<IEmissionCalculationDomainService, EmissionCalculationDomainService>();
            builder.Services.AddScoped<IVerificationProcessDomainService, VerificationProcessDomainService>();

            // MediatR & AutoMapper
            builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(appAssembly));
            builder.Services.AddAutoMapper(appAssembly);

            // Thêm dịch vụ CORS (bạn gọi 2 lần, nhưng không sao, cái này cụ thể hơn)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", // Đặt tên cho policy
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:5173") // Cho phép origin của frontend
                               .AllowAnyHeader()
                               .AllowAnyMethod();
                    });
            });

            Log.Information("Application building started...");
            var app = builder.Build();
            Log.Information("Application built successfully.");


            // === BẮT ĐẦU VÙNG KHỞI TẠO VÀ SEED DATA THỦ CÔNG ===
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<AppDbContext>();
                    // Gọi hàm khởi tạo dữ liệu
                    await DbInitializer.Initialize(context);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred while seeding the database.");
                }
            }

            // ===== KIỂM TRA KẾT NỐI DATABASE =====
            try
            {
                Log.Information("Attempting database connection test...");
                using var scope = app.Services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await dbContext.Database.CanConnectAsync();
                Log.Information("===== DATABASE CONNECTION TEST: SUCCESSFUL =====");
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "===== DATABASE CONNECTION TEST: FAILED. Check connection string or firewall. =====");
                return 1;
            }
            // ===========================================

            // Sử dụng CORS policy đã định nghĩa
            app.UseCors("AllowFrontend");

            // Sử dụng Global Error Handling Middleware
            app.UseMiddleware<ErrorHandlingMiddleware>();

            // Apply migrations nếu đang ở môi trường Development
            if (app.Environment.IsDevelopment())
            {
                using var scope = app.Services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                try
                {
                    Log.Information("Applying database migrations...");
                    await dbContext.Database.MigrateAsync();
                    Log.Information("Database migrations applied successfully");
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Failed to apply database migrations");
                }

                // Swagger UI
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Carbon Lifecycle Service API V1");
                    c.RoutePrefix = string.Empty;
                    c.DocumentTitle = "Carbon Lifecycle Service API Documentation";
                });
            }

            // Pipeline
            app.UseCors("AllowAll");

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            // ======================================================================
            // === THÊM MIDDLEWARE XÁC THỰC ===
            // Phải đặt UseAuthentication TRƯỚC UseAuthorization
            app.UseAuthentication();
            app.UseAuthorization();
            // ======================================================================

            app.MapControllers();

            Log.Information("Carbon Lifecycle Service started successfully on {Environment}",
                app.Environment.EnvironmentName);

            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application terminated unexpectedly");
            return 1;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}