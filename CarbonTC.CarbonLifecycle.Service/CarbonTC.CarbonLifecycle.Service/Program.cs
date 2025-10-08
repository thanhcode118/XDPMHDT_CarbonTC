using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Service.Data;
using MySql.EntityFrameworkCore.Extensions; // Import này cần thiết cho AddMySQL
using CarbonTC.CarbonLifecycle.Service.Repositories;
using CarbonTC.CarbonLifecycle.Service.Models.Entities; // Import các entities

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Cấu hình DbContext với MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySQL(connectionString);
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IGenericRepository<EVJourney>, GenericRepository<EVJourney>>();
builder.Services.AddScoped<IEvJourneyRepository, EvJourneyRepository>();

builder.Services.AddScoped<IGenericRepository<JourneyBatch>, GenericRepository<JourneyBatch>>();
builder.Services.AddScoped<IJourneyBatchRepository, JourneyBatchRepository>();

builder.Services.AddScoped<IGenericRepository<CarbonCredit>, GenericRepository<CarbonCredit>>();
builder.Services.AddScoped<ICarbonCreditRepository, CarbonCreditRepository>();

builder.Services.AddScoped<IGenericRepository<VerificationRequest>, GenericRepository<VerificationRequest>>();
builder.Services.AddScoped<IVerificationRequestRepository, VerificationRequestRepository>();

builder.Services.AddScoped<IGenericRepository<AuditReport>, GenericRepository<AuditReport>>();
builder.Services.AddScoped<IAuditReportRepository, AuditReportRepository>();

builder.Services.AddScoped<IGenericRepository<CVAStandard>, GenericRepository<CVAStandard>>();
builder.Services.AddScoped<ICVAStandardRepository, CVAStandardRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();