using System.Net;
using System.Text.Json;
using CarbonTC.CarbonLifecycle.Application.Common; // Sử dụng ApiResponse<T> của bạn

namespace CarbonTC.CarbonLifecycle.Api.Middlewares
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
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
                _logger.LogError(ex, "An unhandled exception has occurred. Message: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError; // 500
            var errors = new List<string> { exception.Message };
            if (exception.StackTrace != null)
            {
                errors.Add(exception.StackTrace);
            }
            var response = ApiResponse<object>.FailureResponse(
                "An unexpected error occurred. Please try again later.",
                errors // Chỉ bao gồm StackTrace ở môi trường Dev
            );

            // TODO: Bạn có thể thêm logic để xử lý các loại Exception cụ thể (ví dụ: ValidationException)
            // và trả về mã lỗi 400 Bad Request
            // if (exception is ValidationException validationException)
            // {
            //     code = HttpStatusCode.BadRequest;
            //     response = ApiResponse<object>.FailureResponse("Validation failed.", validationException.Errors);
            // }

            var result = JsonSerializer.Serialize(response);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;
            return context.Response.WriteAsync(result);
        }
    }
}