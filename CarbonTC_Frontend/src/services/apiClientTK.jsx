import axios from 'axios';

const apiClientTK = axios.create({
  baseURL: 'http://localhost:5004/api', // Base URL của API
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  }
});

apiClientTK.interceptors.request.use(
  (config) => {
    // Ưu tiên accessToken, fallback về userToken để tương thích ngược
    const token = localStorage.getItem('accessToken') || localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClientTK.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Token expired or invalid');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
    }
    return Promise.reject(error);
  }
);


export default apiClientTK;