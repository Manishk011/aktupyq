import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Provide default initial check if using existing token in localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse user from local storage", err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            const token = res.data?.token;
            const userData = res.data?.user || {
                _id: res.data?._id,
                name: res.data?.name,
                email: res.data?.email,
                role: res.data?.role
            };

            if (token && (userData._id || userData.email)) {
                localStorage.setItem('token', token);
                // Also store user info briefly to avoid fetching /me endpoint
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (name, email, password, role = 'student') => {
        try {
            const res = await api.post('/auth/register', { name, email, password, role });

            const token = res.data?.token;
            const userData = res.data?.user || {
                _id: res.data?._id,
                name: res.data?.name,
                email: res.data?.email,
                role: res.data?.role
            };

            if (token && (userData._id || userData.email)) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Let the components handle redirection based on roles or simple page reloads
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
