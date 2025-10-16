// CarbonTC.Auth.Api/Middleware/ExceptionHandlingMiddleware.cs

using System.Net;
using System.Text.Json;
using CarbonTC.Auth.Application.Exceptions;

namespace CarbonTC.Auth.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        // ✅ FIX: Định nghĩa kiểu rõ ràng
        object response;
        int statusCode;

        switch (exception)
        {
            case ValidationException validationException:
                statusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    success = false,
                    message = "Validation failed",
                    errors = validationException.Errors
                };
                break;

            case UnauthorizedAccessException:
                statusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    success = false,
                    message = exception.Message,
                    errors = (object?)null
                };
                break;

            case KeyNotFoundException:
                statusCode = (int)HttpStatusCode.NotFound;
                response = new
                {
                    success = false,
                    message = exception.Message,
                    errors = (object?)null
                };
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                response = new
                {
                    success = false,
                    message = "An error occurred while processing your request",
                    errors = (object?)null
                };
                break;
        }

        context.Response.StatusCode = statusCode;

        _logger.LogError(exception, "Exception: {Message}", exception.Message);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, jsonOptions)
        );
    }
}