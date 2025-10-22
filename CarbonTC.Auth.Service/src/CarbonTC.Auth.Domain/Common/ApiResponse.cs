// CarbonTC.Auth.Domain/Common/ApiResponse.cs

using System.Text.Json.Serialization;

namespace CarbonTC.Auth.Domain.Common;

/// <summary>
/// Mẫu response chuẩn cho tất cả API endpoints
/// </summary>
public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("errors")]
    public List<string> Errors { get; set; } = new();

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // ===== FACTORY METHODS =====

    /// <summary>
    /// Tạo response thành công với data
    /// </summary>
    public static ApiResponse<T> SuccessResult(T data, string message = "Thành công")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = new List<string>(),
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tạo response lỗi với nhiều lỗi chi tiết
    /// </summary>
    public static ApiResponse<T> ErrorResult(string message, List<string> errors)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = errors,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tạo response lỗi với một lỗi duy nhất
    /// </summary>
    public static ApiResponse<T> ErrorResult(string message, string error)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = new List<string> { error },
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tạo response lỗi không có chi tiết
    /// </summary>
    public static ApiResponse<T> ErrorResult(string message)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            Errors = new List<string>(),
            Timestamp = DateTime.UtcNow
        };
    }
}

/// <summary>
/// API Response không có data (chỉ message và errors)
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    /// <summary>
    /// Tạo response thành công không có data
    /// </summary>
    public static ApiResponse SuccessResult(string message = "Thành công")
    {
        return new ApiResponse
        {
            Success = true,
            Message = message,
            Data = null,
            Errors = new List<string>(),
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tạo response lỗi với nhiều lỗi
    /// </summary>
    public static new ApiResponse ErrorResult(string message, List<string> errors)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Data = null,
            Errors = errors,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tạo response lỗi với một lỗi
    /// </summary>
    public static new ApiResponse ErrorResult(string message, string error)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Data = null,
            Errors = new List<string> { error },
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Tạo response lỗi không có chi tiết
    /// </summary>
    public static new ApiResponse ErrorResult(string message)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Data = null,
            Errors = new List<string>(),
            Timestamp = DateTime.UtcNow
        };
    }
}