import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../authProvider/AuthProvider';
import Loader from '../loader/Loader';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, isLoading, navigate]);

    // Если проверка авторизации ещё не завершена, показываем лоадер
    if (isLoading) {
        return (
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh' 
                }}
            >
                <Loader/>
            </div>
        );
    }

    // Если пользователь авторизован, отображаем дочерний компонент
    return user ? children : null;
};