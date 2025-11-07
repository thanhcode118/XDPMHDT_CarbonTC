import axios from 'axios';

const apiClientPD = axios.create({
  baseURL: 'https://localhost:5003/api', // Base URL của API
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  }
});

apiClientPD.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
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

apiClientPD.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Token expired or invalid');
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
    }
    return Promise.reject(error);
  }
);


export default apiClientPD;