import axios from 'axios';

const TEMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1cGVyYWRtaW5AZWNvbW1lcmNlLmNvbSIsInN1YiI6IjgwOGU0N2Y1LWE3MzMtNDJhYi04ZTMxLWI2YWYzNDliZmQ5MCIsImp0aSI6Ijk1NjczZjkwLTQ3MmUtNDYwZS05ZWUxLWUyODJlZGUxOTBkYiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyJTdXBlckFkbWluIiwiQWRtaW4iLCJVc2VyIl0sIm5iZiI6MTc2MTMwNTg3NywiZXhwIjoxNzYxNjY1ODc3LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3Mjk1IiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzI5NSJ9.85qN8_KFnKCaTz9RsMLYE0Kq3JHBH_ikWCbtB-GOb-U';


const apiClientPD = axios.create({
  baseURL: 'https://localhost:5003/api', // Base URL của API
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  }
});

// Đây là "magic": Tự động thêm token vào MỌI request
apiClientPD.interceptors.request.use(
  (config) => {
    if (TEMP_TOKEN) {
      config.headers.Authorization = `Bearer ${TEMP_TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClientPD;