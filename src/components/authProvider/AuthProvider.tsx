import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    token: string | null;
    user: { id: number; first_name: string; last_name: string; manager_id: number | null; hasSubordinates: boolean; } | null;
    isLoading: boolean; // Добавляем состояние загрузки
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<any>(() => {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    });
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const navigate = useNavigate();

    // Проверка авторизации при монтировании компонента
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
            setIsLoading(false); // Завершаем загрузку
        };

        checkAuth();
    }, []);

    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/todolist/login');
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
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