import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle token refresh and unauthorized errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}auth/refresh-token`, { refreshToken });
                    const { accessToken, refreshToken: newRefreshToken } = response.data.content;

                    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

                    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // If refresh token fails, logout
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.USER);
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
