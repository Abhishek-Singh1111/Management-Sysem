import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL?.trim() || (
    import.meta.env.PROD
        ? 'https://management-sysem.onrender.com/api'
        : 'http://localhost:5000/api'
);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Items API
export const getItems = (filters = {}) => api.get('/items', { params: filters });
export const getItem = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const getItemSummary = () => api.get('/items/summary');

// Auth API calls
export const register = (userData) => api.post('/auth/register', userData);
export const login = (email, password) => api.post('/auth/login', { email, password });
export const refreshToken = (refreshToken) => api.post('/auth/refresh-token', { refreshToken });
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });

// Protected API calls with token
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);
export const getUsers = () => api.get('/auth/users');
export const updateUserRole = (id, role) => api.patch(`/auth/users/${id}/role`, { role });

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        if (config.data && typeof config.data.email === 'string') {
            config.data = {
                ...config.data,
                email: config.data.email.toLowerCase(),
            };
        }

        const token = localStorage.getItem('accessToken')?.trim();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
