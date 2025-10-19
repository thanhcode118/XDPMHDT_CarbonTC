using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using System.Reflection; 
using Microsoft.OpenApi.Models;
using CarbonTC.CarbonLifecycle.Application.Abstractions;
using CarbonTC.CarbonLifecycle.Domain.Services;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using System; 

var builder = WebApplication.CreateBuilder(args);



// Add services to the container.
builder.Services.AddControllers();

// 1. Thêm dịch vụ cho Swagger
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

    // 2. Kích hoạt XML comments để Swagger đọc mô tả từ code của bạn
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) // Chỉ thêm nếu file XML tồn tại
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// <--- Bắt đầu phần đăng ký dịch vụ đã được di chuyển vào đây
// Đăng ký IDomainEventDispatcher
builder.Services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

// Đăng ký Domain Services
builder.Services.AddScoped<IEmissionCalculationDomainService, EmissionCalculationDomainService>();
builder.Services.AddScoped<IVerificationProcessDomainService, VerificationProcessDomainService>();

// Đăng ký Repository Interfaces và Implementations (ví dụ, giả sử bạn đã có Implementations)
// builder.Services.AddScoped<IEVJourneyRepository, EVJourneyRepository>();
// builder.Services.AddScoped<IJourneyBatchRepository, JourneyBatchRepository>();
// ... và các repository khác

// Đăng ký tất cả các Domain Event Handlers của bạn
// Ví dụ: builder.Services.AddScoped<IDomainEventHandler<JourneyBatchSubmittedForVerificationEvent>, MyJourneyBatchSubmittedHandler>();
// Bạn sẽ cần tạo các lớp handler này trong Application Layer hoặc Infrastructure Layer.
// Có thể dùng một cách tự động để đăng ký tất cả các handler trong một assembly.
// Ví dụ (yêu cầu cài đặt package Scrutor):
// builder.Services.Scan(scan => scan
//     .FromAssemblyOf<JourneyBatchSubmittedForVerificationEvent>() // Scan assembly chứa Domain Events
//     .AddClasses(classes => classes.AssignableTo(typeof(IDomainEventHandler<>)))
//     .AsImplementedInterfaces()
//     .WithScopedLifetime());

// Hoặc cách thủ công nếu số lượng ít:
// builder.Services.AddScoped<IDomainEventHandler<CarbonCreditsApprovedEvent>, CarbonCreditsApprovalAuditHandler>();
// builder.Services.AddScoped<IDomainEventHandler<CarbonCreditsRejectedEvent>, CarbonCreditsRejectionLogger>();
// builder.Services.AddScoped<IDomainEventHandler<JourneyBatchSubmittedForVerificationEvent>, JourneyBatchNotificationHandler>();
// ...
// <--- Kết thúc phần đăng ký dịch vụ

// Configure AppDbContext with MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString,
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.SchemaBehavior(MySqlSchemaBehavior.Ignore))); // Use Ignore for consistency if needed, or default

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // 3. Kích hoạt middleware cho Swagger UI
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Carbon Lifecycle Service API V1");
        c.RoutePrefix = string.Empty; // Đặt Swagger UI làm trang chủ
        c.DocumentTitle = "Carbon Lifecycle Service API Documentation";
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();