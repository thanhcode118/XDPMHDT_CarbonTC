namespace CarbonTC.Auth.Api.Models;

public class ErrorResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Errors { get; set; }
}
