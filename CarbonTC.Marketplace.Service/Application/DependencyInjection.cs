using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MediatR;
using System.Reflection;
using Application.Common.Behaviours;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));

            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            // services 

            return services;
        }
    }
}
