// CarbonTC.Auth.Api/Middleware/ExceptionHandlingMiddleware.cs

using System.Net;
using System.Text.Json;
using CarbonTC.Auth.Application.Exceptions;
using CarbonTC.Auth.Domain.Common;

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

        ApiResponse response;
        int statusCode;

        switch (exception)
        {
            case ValidationException validationException:
                statusCode = (int)HttpStatusCode.BadRequest;
                var validationErrors = validationException.Errors
                    .SelectMany(kvp => kvp.Value.Select(error => $"{kvp.Key}: {error}"))
                    .ToList();

                response = ApiResponse.ErrorResult(
                    "Dữ liệu không hợp lệ",
                    validationErrors
                );
                break;

            case UnauthorizedAccessException:
                statusCode = (int)HttpStatusCode.Unauthorized;
                response = ApiResponse.ErrorResult(
                    exception.Message,
                    "Không có quyền truy cập"
                );
                break;

            case KeyNotFoundException:
                statusCode = (int)HttpStatusCode.NotFound;
                response = ApiResponse.ErrorResult(
                    exception.Message,
                    "Không tìm thấy tài nguyên"
                );
                break;

            case InvalidOperationException:
                statusCode = (int)HttpStatusCode.BadRequest;
                response = ApiResponse.ErrorResult(
                    exception.Message,
                    "Thao tác không hợp lệ"
                );
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                response = ApiResponse.ErrorResult(
                    "Đã xảy ra lỗi không mong muốn",
                    exception.Message
                );
                break;
        }

        context.Response.StatusCode = statusCode;

        _logger.LogError(exception, "Exception occurred: {Message}", exception.Message);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, jsonOptions)
        );
    }
}