// src/api/axiosInstance.ts
import axios from 'axios';

const token = 'your-token-here';

const axiosInstance = axios.create({
  baseURL: 'https://api.sante-diabet.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
