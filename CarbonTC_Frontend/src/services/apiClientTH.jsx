import axios from 'axios';

// DÁN TOKEN CỦA BẠN TỪ SWAGGER VÀO ĐÂY
// EVOwner token
//const TEMP_TOKEN_FOR_TESTING = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHxkZW1vLXVzZXItMTIzNDUiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImF1dGgwfGRlbW8tdXNlci0xMjM0NSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkVWT3duZXIiLCJpc3MiOiJDYXJib25UQy5BdXRoIiwiYXVkIjoiQ2FyYm9uVEMuU2VydmljZXMiLCJleHAiOjE3OTg1ODIwMDAsImlhdCI6MTczNTY4OTYwMCwiZW1haWwiOiJldm93bmVyQGNhcmJvbnRjLmRlbW8iLCJuYW1lIjoiRVYgT3duZXIgRGVtbyBVc2VyIiwianRpIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIn0.Dumln6dZQHcSKuo45FuMt873vmjH-D8BM9WQ6kx9_hs'; 
// CVA token 
const TEMP_TOKEN_FOR_TESTING = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHxkZW1vLXVzZXItNjc4OTAiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImF1dGgwfGRlbW8tdXNlci02Nzg5MCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNWQSIsImlzcyI6IkNhcmJvblRDLkF1dGgiLCJhdWQiOiJDYXJib25UQy5TZXJ2aWNlcyIsImV4cCI6MTc5ODU4MjAwMCwiaWF0IjoxNzM1Njg5NjAwLCJlbWFpbCI6ImN2YUBjYXJib250Yy5kZW1vIiwibmFtZSI6IkNWQSBEZW1vIFVzZXIiLCJqdGkiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi01NTY2NTU0NDAwMDAifQ.S0i2rpPAb6BE879nbaAiopPX_4EIuORjP3hHmMkiD1Y'; 
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Sử dụng environment variable nếu có, fallback về localhost:5002 cho development
const baseURL = import.meta.env.VITE_CARBON_LIFECYCLE_API_URL || 'http://localhost:5002/api';

const apiClientTH = axios.create({
  baseURL: baseURL, // Base URL của CarbonLifecycle Service API
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  }
});

// Request Interceptor - Thêm JWT token vào header
apiClientTH.interceptors.request.use(
  (config) => {
    // GIẢ LẬP VIỆC ĐỌC TỪ LOCALSTORAGE
    // Thay vì đọc từ localStorage, chúng ta dùng token cứng
    const token = TEMP_TOKEN_FOR_TESTING; 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log request để debug (chỉ trong development)
      if (import.meta.env.DEV) {
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          hasToken: !!token
        });
      }
    } else {
      console.warn('⚠️ No token found (TESTING)');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý lỗi và token expiration
apiClientTH.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý các loại lỗi khác nhau
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('❌ Network Error - Không thể kết nối đến server:', {
        baseURL: baseURL,
        message: error.message,
        code: error.code,
        suggestion: 'Kiểm tra xem backend server có đang chạy trên port 5002 không. Thử truy cập http://localhost:5002/swagger để kiểm tra.'
      });
      // Tạo error message rõ ràng hơn
      error.userMessage = `Không thể kết nối đến server backend. Vui lòng kiểm tra:
1. Backend server có đang chạy không? (http://localhost:5002/swagger)
2. Port 5002 có bị chặn không?
3. Có lỗi firewall không?`;
    } else if (error.code === 'ERR_EMPTY_RESPONSE') {
      console.error('❌ Empty Response - Server không trả về phản hồi:', {
        baseURL: baseURL,
        url: error.config?.url,
        message: error.message,
        suggestion: 'Server có thể đang crash hoặc không phản hồi. Kiểm tra logs của backend.'
      });
      error.userMessage = `Server không phản hồi. Có thể server đang gặp lỗi. Vui lòng kiểm tra logs của backend server.`;
    } else if (error.response?.status === 401) {
      console.error('❌ Unauthorized - Token expired or invalid:', {
        status: error.response.status,
        message: error.response.data
      });
      error.userMessage = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (error.response?.status === 403) {
      console.error('❌ Forbidden - Không có quyền truy cập:', {
        status: error.response.status,
        message: error.response.data
      });
      error.userMessage = 'Bạn không có quyền truy cập tài nguyên này.';
    } else if (error.response?.status >= 500) {
      console.error('❌ Server Error:', {
        status: error.response.status,
        message: error.response.data
      });
      error.userMessage = 'Lỗi server. Vui lòng thử lại sau.';
    } else if (error.response) {
      // Có response từ server nhưng có lỗi
      console.error('❌ API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
      error.userMessage = error.response.data?.message || `Lỗi: ${error.response.status} - ${error.response.statusText}`;
    } else {
      // Lỗi khác
      console.error('❌ Unknown Error:', error);
      error.userMessage = error.message || 'Đã xảy ra lỗi không xác định.';
    }
    return Promise.reject(error);
  }
);

export default apiClientTH;