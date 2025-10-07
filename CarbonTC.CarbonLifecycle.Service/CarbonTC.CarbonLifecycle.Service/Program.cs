using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Service.Data;
using MySql.EntityFrameworkCore.Extensions; // Import này cần thiết cho AddMySQL

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