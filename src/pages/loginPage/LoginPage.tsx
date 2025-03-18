import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './login-page.css';
import { useAuth } from "../../components/authProvider/AuthProvider";
import axios from 'axios'

export const LoginPage = () => {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLogin(event.target.value);
        if (error === 'Пользователя с таким логином не существует') {
            setError('');
        }
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
        if (error === 'Неверный пароль') {
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед отправкой запроса

        try {
            const response = await axios.post('/api/login', {
                login,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        
            console.log('Логин и пароль:', login, password); // Логируем введенные данные
        
            // Логируем ответ сервера
            console.log('Response:', response.data);
        
            // Если авторизация успешна, сохраняем токен и данные пользователя
            const { token, user } = response.data;
            authLogin(token, user);
            navigate('/todolist/tasks');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                // Обработка ошибок Axios
                if (err.response) {
                    // Сервер вернул ответ с ошибкой
                    const errorData = err.response.data;
                    if (errorData.error === 'Пользователя с таким логином не существует') {
                        setError('Пользователя с таким логином не существует');
                    } else if (errorData.error === 'Неверный пароль') {
                        setError('Неверный пароль');
                    } else {
                        setError('Ошибка при входе');
                    }
                } else if (err.request) {
                    // Запрос был отправлен, но ответ не получен
                    setError('Сервер не отвечает. Обновите приложение.');
                } else {
                    // Ошибка при настройке запроса
                    setError('Ошибка при отправке запроса. Обновите приложение.');
                }
            } else {
                // Обработка других ошибок
                setError(err instanceof Error ? err.message : 'Ошибка при входе');
            }
            console.error('Ошибка при входе:', err);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page-container">
                <h1 className="login-page-container-header">Task Manager</h1>
                <form onSubmit={handleSubmit} className="login-page-container-form">
                    <div className={`login-page-container-form--login ${error === 'Пользователя с таким логином не существует' ? 'error' : ''}`}>
                        <input
                            type="text"
                            id="login"
                            placeholder="Логин"
                            value={login}
                            onChange={handleLoginChange}
                        />
                    </div>
                    <div className={`login-page-container-form--password ${error === 'Неверный пароль' ? 'error' : ''}`}>
                        <input
                            type="password"
                            id="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </div>
                        {error ? (
                            <p className="login-page-container-form--error">{error}</p>
                            ) : (
                            <button type="submit" className="login-page-container-form-submit">
                                Войти
                            </button>
                        )}
                </form>
            </div>
        </div>
    );
};