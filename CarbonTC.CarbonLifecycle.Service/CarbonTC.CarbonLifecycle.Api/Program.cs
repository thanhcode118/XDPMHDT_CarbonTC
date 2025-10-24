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

            // Swagger/OpenAPI
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
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

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }
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

            // Thêm dịch vụ CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", // Đặt tên cho policy, ví dụ: "AllowFrontend"
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:5173") // Cho phép origin của frontend
                               .AllowAnyHeader() // Cho phép tất cả các header (bao gồm Authorization)
                               .AllowAnyMethod(); // Cho phép các phương thức GET, POST, PUT, DELETE, OPTIONS,...
                                                  // .AllowCredentials(); // Bỏ comment dòng này nếu bạn cần gửi cookie hoặc thông tin xác thực phức tạp hơn
                    });
            });

            Log.Information("Application building started...");
            var app = builder.Build();
            Log.Information("Application built successfully.");



            // ===== KIỂM TRA KẾT NỐI DATABASE =====
            try
            {
                Log.Information("Attempting database connection test...");
                using var scope = app.Services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Thực hiện một kết nối thử
                await dbContext.Database.CanConnectAsync();

                Log.Information("===== DATABASE CONNECTION TEST: SUCCESSFUL =====");
            }
            catch (Exception ex)
            {
                // Ghi log lỗi nghiêm trọng nếu không kết nối được
                Log.Fatal(ex, "===== DATABASE CONNECTION TEST: FAILED. Check connection string or firewall. =====");

                // Dừng ứng dụng
                return 1;
            }
            // ===========================================
            // Sử dụng CORS policy đã định nghĩa
            app.UseCors("AllowFrontend"); // Sử dụng đúng tên policy đã đặt ở trên
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

            app.UseAuthorization();
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
