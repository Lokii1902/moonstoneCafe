import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    // Pre-configure the token in api utility might be handled, but explicit here as safety or assume api uses localStorage.
                    const { data } = await api.get('/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(data);
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userName');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userName', userData.name);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
