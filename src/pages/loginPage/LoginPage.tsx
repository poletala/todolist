import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../../components/authProvider/AuthProvider';
import Icon from '../../assets/esoft-icon.png';

import './login-page.css';

export const LoginPage = () => {
    // Состояния для хранения логина, пароля и ошибки
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Используем хук useAuth для доступа к функции login
    const { login: authLogin } = useAuth();

    const navigate = useNavigate();

    // Обработчик изменения логина
    const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLogin(event.target.value);
        // Если ошибка была связана с логином, сбрасываем её
        if (error === 'Пользователя с таким логином не существует') {
            setError('');
        }
    };

    // Обработчик изменения пароля
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
        // Если ошибка была связана с паролем, сбрасываем её
        if (error === 'Неверный пароль') {
            setError('');
        }
    };

    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/api/login', {
                login,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json', // Указываем тип содержимого
                },
            });

            // Логируем данные для отладки
            console.log('Логин и пароль:', login, password);
            console.log('Response:', response.data);

            // Если авторизация успешна, сохраняем токен и данные пользователя
            const { token, user } = response.data;
            authLogin(token, user); // Вызываем функцию login из AuthProvider
            navigate("/todolist/tasks");
        } catch (err) {
            // Обработка ошибок
            if (axios.isAxiosError(err)) {
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
                    setError('Ошибка при отправке запроса. Обновите приложение.');
                }
            } else {
                // Обработка других ошибок
                setError(err instanceof Error ? err.message : 'Ошибка при входе');
            }
            console.error('Ошибка при входе:', err); // Логируем ошибку для отладки
        }
    };

    return (
        <div className="login-page">
            <div className="login-page-container">
                <h1 className="login-page-container-header">
                    <img 
                        src={Icon} 
                        alt="Esoft Icon" 
                        className="login-page-icon" 
                    />
                    Task Manager
                </h1>
                <form 
                    onSubmit={handleSubmit} 
                    className="login-page-container-form"
                >
                    <div 
                        className={`login-page-container-form--login ${error === 'Пользователя с таким логином не существует' 
                        ? 'error' 
                        : ''}`}
                    >
                        <input
                            type="text"
                            id="login"
                            placeholder="Логин"
                            value={login}
                            onChange={handleLoginChange}
                        />
                    </div>
                    <div 
                        className={`login-page-container-form--password ${error === 'Неверный пароль' 
                        ? 'error' 
                        : ''}`}
                    >
                        <input
                            type="password"
                            id="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    {error ? (
                        <p className="login-page-container-form--error">
                            {error}
                        </p>
                    ) : (
                        <button 
                            type="submit" 
                            className="login-page-container-form-submit"
                        >
                            Войти
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};