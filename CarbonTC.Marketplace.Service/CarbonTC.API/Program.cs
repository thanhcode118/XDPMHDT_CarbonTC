
using Application;
using CarbonTC.API.Common.ExceptionHandling;
using CarbonTC.API.ExceptionHandling;
using Infrastructure;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using SharedLibrary.Extensions;
using System.Diagnostics;

namespace CarbonTC.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

            // Add services to the container.
            builder.Services.AddProblemDetails(options =>
            {
                options.CustomizeProblemDetails = context =>
                {
                    context.ProblemDetails.Instance = $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
                    context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);
                    Activity? activity = context.HttpContext.Features.Get<IHttpActivityFeature>()?.Activity;
                    context.ProblemDetails.Extensions.TryAdd("traceId", activity?.Id);
                };
            });

            builder.Services.AddSharedRabbitMQ(builder.Configuration);


            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddInfrastructure(builder.Configuration);  
            builder.Services.AddApplication();  

            var app = builder.Build();

            app.UseExceptionHandler();

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
        }
    }
}
