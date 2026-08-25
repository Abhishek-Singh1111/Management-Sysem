// context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect, react-hooks/immutability, react-hooks/exhaustive-deps */
import { createContext, useState, useContext, useEffect } from 'react';
import api, { login as loginApi, register as registerApi, refreshToken as refreshTokenApi, logout as logoutApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

    useEffect(() => {
        // Initialize auth state from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser && accessToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);

        // Set up axios interceptor for token refresh
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && refreshToken && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh-token')) {
                    originalRequest._retry = true;
                    try {
                        const response = await refreshTokenApi(refreshToken);
                        const newAccessToken = response.data.data.accessToken;
                        setAccessToken(newAccessToken);
                        localStorage.setItem('accessToken', newAccessToken);
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, refreshToken]);

    const login = async (email, password) => {
        try {
            const response = await loginApi(email, password);
            const { user, accessToken, refreshToken } = response.data.data;
            
            setUser(user);
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.removeItem('token');
            
            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await registerApi(userData);
            const { user, accessToken, refreshToken } = response.data.data;
            
            setUser(user);
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.removeItem('token');
            
            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            if (refreshToken) {
                await logoutApi(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('token');
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        accessToken,
        refreshToken,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user && !!accessToken,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};