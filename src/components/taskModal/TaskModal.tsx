import { useState, useEffect } from 'react';
import axios from 'axios';

import { Task } from '../../types';

import './task-modal.css';

interface TaskModalProps {
    task?: Task | null;
    isAnimating: boolean;
    onClose: () => void;
    onSave: (task: Task) => Promise<void>;
    currentUserId: number;
    currentUserRole: number | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
    task, 
    onClose, 
    onSave, 
    isAnimating, 
    currentUserId, 
    currentUserRole 
}) => {
    const [title, setTitle] = useState(task?.title || "");
    const [priority, setPriority] = useState<Task["priority"]>(task?.priority || "низкий");
    const [dueDate, setDueDate] = useState(task?.due_date || "");
    const [responsible, setResponsible] = useState<number>(task?.assignee_id || 0);
    const [status, setStatus] = useState<Task["status"]>(task?.status || "к выполнению");
    const [responsibles, setResponsibles] = useState<{ id: number; name: string }[]>([]);
    const [isEditable, setIsEditable] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Получаем текущую дату в формате YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Загрузка списка ответственных
    useEffect(() => {
        const fetchResponsibles = async () => {
            try {
                const response = await axios.get('/api/users/responsibles', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.data) {
                    setResponsibles(response.data);
                } else {
                    setError(response.data.error || 'Ошибка при загрузке ответственных');
                }
            } catch (err) {
                console.error('Ошибка при загрузке ответственных:', err);
                setError('Ошибка при загрузке ответственных');
            }
        };

        fetchResponsibles();
    }, []);

    // Проверка, можно ли редактировать задачу
    useEffect(() => {
        if (task) {
            if (currentUserRole === null) {
                setIsEditable(true);
            } else {
                const isCreator = task.creator_id === currentUserId;
                setIsEditable(isCreator);
            }
        } else {
            setIsEditable(true);
        }
    }, [task, currentUserId, currentUserRole]);

    // Обработчик сохранения задачи
    const handleSave = async () => {
        setError(null);

        if (!title || !priority || !dueDate || !responsible || !status) {
            setError("Все поля обязательны для заполнения");
            return;
        }

        // Проверка даты
        const currentDate = getCurrentDate();
        if (dueDate < currentDate) {
            setError("Дата завершения не может быть меньше текущей даты");
            return;
        }

        const newTask: Task = {
            id: task?.id || 0,
            title,
            priority,
            due_date: dueDate,
            assignee_id: responsible,
            creator_id: task?.creator_id || currentUserId,
            creator_role: task?.creator_role || null,
            status,
            created_at: task?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            await onSave(newTask);
        } catch (err) {
            console.error('Ошибка при сохранении задачи:', err);
            setError((err as Error).message || 'Ошибка при сохранении задачи');
        }
    };

    return (
        <div className={`modal-overlay ${isAnimating ? "open" : "close"}`}>
            <div className={`modal ${isAnimating ? "open" : "close"}`}>
                <h2>{task?.id ? "Редактировать" : "Новое задание"}</h2>
                <form>
                    <div className="form-group">
                        <label>Заголовок:</label>
                        <textarea 
                            value={title} 
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (error) setError(null);
                            }} 
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="form-group">
                        <label>Приоритет:</label>
                        <select 
                            value={priority} 
                            onChange={(e) => {
                                setPriority(e.target.value as Task["priority"]);
                                if (error) setError(null);
                            }}
                            disabled={!isEditable}
                        >
                            <option value="низкий">Низкий</option>
                            <option value="средний">Средний</option>
                            <option value="высокий">Высокий</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Дата завершения:</label>
                        <input 
                            type="date" 
                            value={dueDate} 
                            min={getCurrentDate()} // Устанавливаем минимальную дату
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                if (selectedDate < getCurrentDate()) {
                                    setError("Дата завершения не может быть меньше текущей даты");
                                } else {
                                    setDueDate(selectedDate);
                                    if (error) setError(null);
                                }
                            }} 
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ответственный:</label>
                        <select 
                            value={responsible} 
                            onChange={(e) => {
                                setResponsible(Number(e.target.value));
                                if (error) setError(null);
                            }}
                            disabled={!isEditable}
                        >
                            <option value="">Выберите ответственного</option>
                            {responsibles.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Статус:</label>
                        <select 
                            value={status} 
                            onChange={(e) => {
                                setStatus(e.target.value as Task["status"]);
                                if (error) setError(null);
                            }}
                        >
                            <option value="к выполнению">К выполнению</option>
                            <option value="выполняется">Выполняется</option>
                            <option value="выполнена">Выполнена</option>
                            <option value="отменена">Отменена</option>
                        </select>
                    </div>
                    {error && <p className="error-message" style={{textAlign: "center", color: "var(--background-color"}}>{error}</p>}
                    <div className="buttons">
                        <button type="button" onClick={handleSave} style={{ opacity: error ? 0.5 : 1 }}>Сохранить</button>
                        <button type="button" className="cancel" onClick={onClose}>Закрыть</button>
                    </div>
                </form>
            </div>
        </div>
    );
};