namespace CarbonTC.CarbonLifecycle.Service.Common.ApiResponse
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }

        public string Message { get; set; }

        public T Data { get; set; }

        public List<string> Errors { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> SuccessResponse(T data, string message = "Success")
        {
            return new ApiResponse<T> { Success = true, Data = data, Message = message };
        }

        public static ApiResponse<T> FailResponse(string message, List<string> errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default(T), // Đảm bảo data là null hoặc giá trị mặc định
                Errors = errors ?? new List<string>()
            };
        }
    }
}