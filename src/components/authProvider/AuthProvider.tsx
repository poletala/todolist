import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContextType } from '../../types';

// Создание контекста
const AuthContext = createContext<AuthContextType | null>(null);

// Провайдер для управления авторизацией
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<any>(() => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Проверка авторизации при загрузке
    useEffect(() => {
        const checkAuth = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } else {
                setToken(null);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Вход пользователя
    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    // Выход пользователя
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/login'); 
    };

    // Возвращаем провайдер с текущими значениями
    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для использования контекста авторизации
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider'); // Ошибка, если хук используется вне провайдера
    }
    return context;
};