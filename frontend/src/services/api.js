import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: 'https://intellitype-ai.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a "Interceptor" to automatically add the Token to requests if we have one
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;