import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const getBaseUrl = () => {
    const hostname = window.location.hostname;
    // backend is assumed to be on port 8000 on the same host
    return `http://${hostname}:8000/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying (to avoid infinite loops)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Ignore 401 from /auth/me/ to prevent login loop
            // Also ignore 401 from /auth/login/ so we can handle invalid credentials in the form
            if (originalRequest.url.includes('/auth/me/') || originalRequest.url.includes('/auth/login/')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // Clear token
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            useAuthStore.getState().logout(); // If store is available outside hook

            // Redirect to login or just refresh page to clear state
            window.location.href = '/login';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;
