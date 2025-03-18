import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

import { GroupingType, Task } from '../../types';
import { TaskModal } from '../../components/taskModal/TaskModal';
import { useAuth } from '../../components/authProvider/AuthProvider';
import Loader from '../../components/loader/Loader';
import { TaskList } from '../../components/taskList/TaskList';

import './main-page.css';

const socket = io('http://localhost:3001', {
    withCredentials: true, // Разрешаем передачу куки и заголовков авторизации
});

export const MainPage: React.FC = () => {
    const [grouping, setGrouping] = useState<GroupingType>('none'); // Состояние для выбранной группировки
    const [selectedTask, setSelectedTask] = useState<Task | null>(null); // Выбранная задача для редактирования
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
    const [isAnimating, setIsAnimating] = useState(false); // Анимация модального окна
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user, logout } = useAuth(); // Данные авторизованного пользователя

    // Загрузка задач при монтировании компонента
    useEffect(() => {
        fetchTasks();
    }, [user]);

    // Подключение к WebSocket и обработка событий
    useEffect(() => {
        socket.on('newTask', (newTask) => {
            setTasks((prevTasks) => {
                const taskExists = prevTasks.some((task) => task.id === newTask.id);
                if (!taskExists) {
                    return [newTask, ...prevTasks];
                }
                return prevTasks;
            });
        });

        socket.on('taskUpdated', (updatedTask) => {
            setTasks((prevTasks) => {
                const updatedTasks = prevTasks.map((task) => {
                    if (task.id === updatedTask.id) {
                        return { ...task, ...updatedTask };
                    }
                    return task;
                });
                return updatedTasks;
            });
        });

        return () => {
            socket.off('newTask');
            socket.off('taskUpdated');
        };
    }, []);

    // Функция для загрузки задач с сервера
    const fetchTasks = async () => {
        try {
            const response = await axios.get('/api/tasks', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (Array.isArray(response.data)) {
                const tasksWithAssigneeName = response.data.map((task) => ({
                    ...task,
                    assignee_name: task.first_name && task.last_name 
                        ? `${task.last_name} ${task.first_name}` 
                        : "Неизвестный",
                }));
                setTasks(tasksWithAssigneeName);
            } else {
                console.error('Ожидался массив задач, но получено:', response.data);
                setTasks([]);
            }
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
            setError('Ошибка при загрузке задач');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // Обработчик открытия модального окна для редактирования задачи
    const openTaskModal = (task?: Task) => {
        setSelectedTask(task || null);
        setIsModalOpen(true);
        setIsAnimating(true);
    };

    // Обработчик сохранения задачи
    const handleSaveTask = async (savedTask: Task) => {
        try {
            const isNewTask = !savedTask.id;
            const url = isNewTask ? '/api/tasks' : `/api/tasks/${savedTask.id}`;
            const method = isNewTask ? 'POST' : 'PUT';

            if (isNewTask) {
                savedTask.created_at = new Date().toISOString();
            }
            savedTask.updated_at = new Date().toISOString();

            const response = await axios({
                method,
                url,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                data: savedTask,
            });

            if (response.status === 200 || response.status === 201) {
                setTasks((prevTasks) => {
                    const updatedTasks = prevTasks.map((task) =>
                        task.id === savedTask.id ? savedTask : task
                    );
                    return isNewTask ? [savedTask, ...updatedTasks] : updatedTasks;
                });

                await fetchTasks();
            }
        } catch (err) {
            console.error('Ошибка при сохранении задачи:', err);
            setError((err as Error).message || 'Ошибка при сохранении задачи');
        } finally {
            setIsModalOpen(false);
        }
    };

    // Если произошла ошибка, разлогиниваем пользователя
    if (error === 'Ошибка при загрузке задач' || error === 'Ошибка при сохранении задачи') {
        logout();
    }

    return (
        <div className="task-list-container">
            <div className="task-list-container-header">
                <div className="task-list-container-header-userinfo">
                    <span>{user?.first_name} {user?.last_name}</span>
                    <button onClick={logout}>Выйти</button>
                </div>
                <h1>Список задач</h1>
            </div>
            <div className="task-list-container-sort">
                <button onClick={() => setGrouping("none")}>Все задачи</button>
                <button onClick={() => setGrouping("date")}>По дате</button>
                {user?.hasSubordinates && (
                    <button onClick={() => setGrouping("responsible")}>По ответственным</button>
                )}
                <button onClick={() => openTaskModal()}>+</button>
            </div>
            {loading ? (
                <div style={{ width: "100px", margin: "auto" }}>
                    <Loader />
                </div>
            ) : error ? (
                <p style={{ color: "var(--background-color", textAlign: "center" }}>
                    {error}
                </p>
            ) : (
                <TaskList
                    tasks={tasks}
                    grouping={grouping}
                    currentUserId={user?.id || 0}
                    onClick={openTaskModal}
                />
            )}

            {isModalOpen && (
                <TaskModal
                    task={selectedTask}
                    isAnimating={isAnimating}
                    onClose={() => {
                        setIsAnimating(false);
                        setTimeout(() => setIsModalOpen(false), 300);
                    }}
                    onSave={handleSaveTask}
                    currentUserId={user?.id || 0}
                    currentUserRole={user?.manager_id || null}
                />
            )}
        </div>
    );
};