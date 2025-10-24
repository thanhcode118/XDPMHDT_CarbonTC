
using Application;
using CarbonTC.API.Common.ExceptionHandling;
using CarbonTC.API.ExceptionHandling;
using CarbonTC.API.Extensions;
using Infrastructure;
using Infrastructure.BackgroundJobs;
using Infrastructure.BackgroundJobs.Consumer;
using Infrastructure.SignalR.Hubs;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.OpenApi.Models;
using SharedLibrary.Extensions;
using System.Diagnostics;

namespace CarbonTC.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;

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

            builder.Services.AddAuthenticationAndAuthorization(builder.Configuration);
            builder.Services.AddSharedRabbitMQ(builder.Configuration);


            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

            builder.Services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
                options.MaximumReceiveMessageSize = 102400; 
                options.KeepAliveInterval = TimeSpan.FromSeconds(15);
                options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("SignalRPolicy", policy =>
                {
                    policy.WithOrigins("http://localhost:3000") 
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); 
                });
            });


            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
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

            builder.Services.AddHttpContextAccessor();
            builder.Services.AddInfrastructure(builder.Configuration);  
            builder.Services.AddApplication();

            builder.Services.AddHostedService<CreditInventoryConsumerHostedService>();
            builder.Services.AddHostedService<AuctionStatusUpdaterService>();

            var app = builder.Build();

            app.UseExceptionHandler();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseRouting();

            app.UseCors("SignalRPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.MapHub<AuctionHub>("/hubs/auction");

            app.Run();
        }
    }
}
