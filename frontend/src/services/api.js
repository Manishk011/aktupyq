import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            // Optional: Redirect to login or let the Context handle it
            if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            } else if (!window.location.pathname.startsWith('/admin') && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ==========================================
// Public Data Fetching Functions
// ==========================================

export const getCourses = async () => {
    const res = await api.get('/courses');
    return res.data;
};

export const getBranches = async (courseId) => {
    const res = await api.get(`/branches/${courseId}`);
    return res.data;
};

export const getYears = async (branchId) => {
    const res = await api.get(`/years/${branchId}`);
    return res.data;
};

export const getSubjects = async (yearId) => {
    const res = await api.get(`/subjects/${yearId}`);
    return res.data;
};

export const getMaterials = async (subjectId, type = '') => {
    // Note: The API accepts 'notes', 'pyq', 'syllabus'
    const params = type ? { type: type.toLowerCase() } : {};
    const res = await api.get(`/materials/${subjectId}`, { params });
    return res.data;
};

export const globalSearch = async (query) => {
    const res = await api.get('/search', { params: { q: query } });
    return res.data;
};

export const submitContact = async (contactData) => {
    const res = await api.post('/contacts', contactData);
    return res.data;
};

// ==========================================
// Admin Delete Operations
// ==========================================

export const deleteCourse = async (id) => {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
};

export const deleteBranch = async (id) => {
    const res = await api.delete(`/branches/${id}`);
    return res.data;
};

export const deleteYear = async (id) => {
    const res = await api.delete(`/years/${id}`);
    return res.data;
};

export const deleteSubject = async (id) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
};

// ==========================================
// Admin Update Operations
// ==========================================

export const updateMaterial = async (id, formData) => {
    const res = await api.put(`/materials/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// ==========================================
// Admin Dashboard Operations
// ==========================================

export const getDashboardStats = async () => {
    const res = await api.get('/stats');
    return res.data;
};

export const getAdminContacts = async () => {
    const res = await api.get('/contacts');
    return res.data;
};

export const getUnreadContactCount = async () => {
    const res = await api.get('/contacts/unread-count');
    return res.data;
};

export const updateContactStatus = async (id, status) => {
    const res = await api.put(`/contacts/${id}/status`, { status });
    return res.data;
};

export const deleteContact = async (id) => {
    const res = await api.delete(`/contacts/${id}`);
    return res.data;
};

// ==========================================
// Auth Operations
// ==========================================

export const changePassword = async (data) => {
    const res = await api.put('/auth/change-password', data);
    return res.data;
};

export const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
};

export const resetPassword = async (token, password) => {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    return res.data;
};
