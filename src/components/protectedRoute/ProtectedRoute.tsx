import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authProvider/AuthProvider';
import { ClipLoader } from 'react-spinners'; // Импортируем спиннер

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();

    // Если проверка авторизации ещё не завершена, показываем спиннер
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ClipLoader color="#36d7b7" size={50} /> {/* Используем ClipLoader */}
            </div>
        );
    }

    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Если пользователь авторизован, отображаем дочерний компонент
    return children;
};