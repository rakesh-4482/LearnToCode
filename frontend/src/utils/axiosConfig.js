import axios from 'axios';
import { BACKEND_URL } from '../config.js';

// Create axios instance with default config
const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true, // This is important for sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        // You can add auth token here if using token-based auth
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token if using token-based auth
                // const response = await axios.post(`${BACKEND_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
                // const { token } = response.data;
                // localStorage.setItem('token', token);
                // originalRequest.headers.Authorization = `Bearer ${token}`;
                // return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                console.error('Session expired. Please log in again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
