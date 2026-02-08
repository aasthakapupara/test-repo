import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('auth/login', { email, password });
            const { accessToken, refreshToken, ...userData } = response.data.content;

            localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed. Please try again.';
        }
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
