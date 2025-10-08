using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MediatR;
using System.Reflection;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(Common.Behaviours.ValidationBehaviour<,>));

            // services 

            return services;
        }
    }
}
