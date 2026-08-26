// src/api/endpoints.js
import apiClient from './client';

// Auth endpoints
export const authAPI = {
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    register: (data) => apiClient.post('/auth/register', data),
    logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refreshToken }),
    getProfile: () => apiClient.get('/auth/profile'),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    changePassword: (data) => apiClient.put('/auth/change-password', data),
};

// Student Fund endpoints
export const studentFundAPI = {
    getAll: (params) => apiClient.get('/student-funds', { params }),
    getById: (id) => apiClient.get(`/student-funds/${id}`),
    getByStudentId: (studentId) => apiClient.get(`/student-funds/student/${studentId}`),
    create: (data) => apiClient.post('/student-funds', data),
    update: (id, data) => apiClient.put(`/student-funds/${id}`, data),
    updatePayment: (id, data) => apiClient.put(`/student-funds/${id}/payment`, data),
    delete: (id) => apiClient.delete(`/student-funds/${id}`),
    bulkImport: (data) => apiClient.post('/student-funds/bulk-import', data),
    getSummary: (params) => apiClient.get('/student-funds/summary', { params }),
    getSummaryBySemester: () => apiClient.get('/student-funds/summary/semester'),
    getSummaryByDepartment: () => apiClient.get('/student-funds/summary/department'),
    getSummaryByBranch: (params) => apiClient.get('/student-funds/summary/branch', { params }),
    getCollections: (params) => apiClient.get('/student-funds/collections', { params }),
    exportData: (params) => apiClient.get('/student-funds/export/data', { params }),
};

// Department endpoints
export const departmentAPI = {
    getAll: () => apiClient.get('/departments'),
    getById: (id) => apiClient.get(`/departments/${id}`),
    create: (data) => apiClient.post('/departments', data),
    update: (id, data) => apiClient.put(`/departments/${id}`, data),
    delete: (id) => apiClient.delete(`/departments/${id}`),
};

// Branch endpoints
export const branchAPI = {
    getAll: (params) => apiClient.get('/branches', { params }),
    getById: (id) => apiClient.get(`/branches/${id}`),
    getByDepartment: (departmentId) => apiClient.get(`/branches/department/${departmentId}`),
    create: (data) => apiClient.post('/branches', data),
    update: (id, data) => apiClient.put(`/branches/${id}`, data),
    delete: (id) => apiClient.delete(`/branches/${id}`),
};

// Semester endpoints
export const semesterAPI = {
    getAll: () => apiClient.get('/semesters'),
    getById: (id) => apiClient.get(`/semesters/${id}`),
    create: (data) => apiClient.post('/semesters', data),
    update: (id, data) => apiClient.put(`/semesters/${id}`, data),
    delete: (id) => apiClient.delete(`/semesters/${id}`),
};