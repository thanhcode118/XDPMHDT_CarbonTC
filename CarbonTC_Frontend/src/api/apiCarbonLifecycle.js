import axios from 'axios';

// URL của CarbonLifecycle.Service (từ launchSettings.json của backend)
const API_BASE_URL = 'https://localhost:7207'; 

const apiCarbonLifecycle = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor xử lý cấu trúc ApiResponse<T> (Lấy từ project H) ---
apiCarbonLifecycle.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data.success === 'boolean') {
      if (response.data.success) {
        return response.data.data;
      } else {
        const errorMessage = response.data.message || 'Đã có lỗi xảy ra từ API.';
        return Promise.reject(new Error(errorMessage));
      }
    }
    return response.data;
  },
  (error) => {
    let errorMessage = 'Lỗi kết nối hoặc lỗi không xác định.';
    if (error.response) {
      errorMessage = `Lỗi ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;

      // XỬ LÝ 401/403 (Quan trọng)
      if (error.response.status === 401) {
         console.error("Token không hợp lệ hoặc hết hạn cho CarbonLifecycle API.");
         localStorage.clear();
         window.location.href = '/login';
      }
    } else if (error.request) {
      errorMessage = 'Không nhận được phản hồi từ máy chủ (CarbonLifecycle).';
    } else {
      errorMessage = error.message;
    }
    console.error('Axios Error (CarbonLifecycle):', error);
    return Promise.reject(new Error(errorMessage));
  }
);

// --- Interceptor để tự động thêm Authorization header (BẮT BUỘC) ---
apiCarbonLifecycle.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiCarbonLifecycle;