import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem('token');
            const userDataString = localStorage.getItem('user');

            if (token && userDataString) {
                const userData = JSON.parse(userDataString);
                try {
                    // Check backend connectivity and token validity
                    if (userData.role === 'nri') {
                        await api.get('/users/me');
                    } else if (userData.role === 'companion') {
                        await api.get('/companions/me');
                    } else if (userData.role === 'admin') {
                        await api.get('/dashboard/admin/overview'); // Admin check
                    }
                    // If successful, set user
                    setUser(userData);
                } catch (error) {
                    console.error("Session verification failed (Backend may be down):", error);
                    // Invalid session or backend down -> Logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        verifySession();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { access_token, refresh_token, user_id, role } = response.data;
        const userData = { id: user_id, role };
        localStorage.setItem('token', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return response.data;
    };

    const signupNri = async (data) => {
        return await api.post('/auth/nri/signup', data);
    };

    const signupCompanion = async (data) => {
        return await api.post('/auth/companion/signup', data);
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { refresh_token: refreshToken });
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signupNri, signupCompanion, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
