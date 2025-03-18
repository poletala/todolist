import { useEffect, useState } from "react";
import { GroupingType, Task } from "../../types";
import { TaskModal } from "../../components/taskModal/TaskModal";
import './main-page.css';
import axios from "axios";
import { useAuth } from "../../components/authProvider/AuthProvider";
import Loader from "../../components/loader/Loader";
import { io } from 'socket.io-client';

const socket = io('/')

interface TaskListProps {
    tasks?: Task[];
}

export const MainPage: React.FC<TaskListProps> = () => {
    const [grouping, setGrouping] = useState<GroupingType>("none");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user, logout } = useAuth();

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Загрузка задач
    useEffect(() => {
        fetchTasks();
    }, [user]);

    // Подключение к WebSocket и обработка событий
    useEffect(() => {
        // Событие для новой задачи
        socket.on('newTask', (newTask) => {
            setTasks((prevTasks) => {
                const taskExists = prevTasks.some((task) => task.id === newTask.id);
                if (!taskExists) {
                    return [newTask, ...prevTasks];
                }
                return prevTasks;
            });
        });

        // Событие для обновленной задачи
        socket.on('taskUpdated', (updatedTask) => {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );
        });

        // Отключение слушателей при размонтировании компонента
        return () => {
            socket.off('newTask');
            socket.off('taskUpdated');
        };
    }, []);

    // При изменении группировки сбрасываем раскрытые группы и прокручиваем в начало
    useEffect(() => {
        setExpandedGroups({});
        const groupWrapper = document.querySelector(".task-list-container-group-wrapper");
        if (groupWrapper) {
            groupWrapper.scrollTo({
                top: 0,
                behavior: "auto",
            });
        }
    }, [grouping]);

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

    if (error === "Ошибка при загрузке задач" || error === 'Ошибка при сохранении задачи') {
        logout();
    }

    // Группировка задач
    const groupTasks = (tasks: Task[], grouping: GroupingType, currentUserId: number) => {
        const today = new Date().toISOString().split("T")[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        switch (grouping) {
            case "date":
                return {
                    "На сегодня": tasks.filter((task) => task.due_date === today),
                    "На неделю": tasks.filter((task) => task.due_date > today && task.due_date <= nextWeek),
                    "На будущее": tasks.filter((task) => task.due_date > nextWeek),
                };
            case "responsible":
                return tasks.reduce((acc, task) => {
                    const groupName = task.assignee_id === currentUserId 
                        ? "Мои задачи" 
                        : `${task.first_name || ''} ${task.last_name || ''}`.trim();
                    if (!acc[groupName]) acc[groupName] = [];
                    acc[groupName].push(task);
                    return acc;
                }, {} as Record<string, Task[]>);
            case "none":
            default:
                return { "Все задачи": tasks };
        }
    };

    // Сортировка задач
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // Группированные задачи
    const groupedTasks = groupTasks(sortedTasks, grouping, user?.id || 0);

    // Сортировка групп: "Мои задачи" всегда первые
    const sortedGroupedTasks = Object.entries(groupedTasks).sort(([groupName]) => {
        return groupName === "Мои задачи" ? -1 : 1;
    });

    // Цвет заголовка задачи
    const getTaskTitleColor = (task: Task) => {
        const today = new Date().toISOString().split("T")[0];
        if (task.status === "выполнена") return "var(--done-tasks-color)";
        if (task.due_date < today && task.status !== "отменена") return "var(--overdue-tasks-color)";
        return "var(--in-progress-tasks-color)";
    };

    // Открытие модального окна для редактирования задачи
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
            console.log(savedTask, url)

            const response = await axios({
                method,
                url,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                data: savedTask,
            });

            if (response.status === 200 || response.status === 201) {
                // Обновляем локальное состояние
                setTasks((prevTasks) => {
                    const updatedTasks = prevTasks.map((task) =>
                        task.id === savedTask.id ? savedTask : task
                    );
                    return isNewTask ? [savedTask, ...updatedTasks] : updatedTasks;
                });

                await fetchTasks(); // Загружаем обновленные задачи с сервера
            }
        } catch (err) {
            console.error('Ошибка при сохранении задачи:', err);
            setError((err as Error).message || 'Ошибка при сохранении задачи');
        } finally {
            setIsModalOpen(false);
        }
    };

    // Обработчик раскрытия/скрытия группы
    const toggleGroup = (groupName: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    return (
        <div className="task-list-container">
            <div className="task-list-container-header">
                <div className="task-list-container-header-userinfo">
                    <span>{user?.first_name} {user?.last_name}</span>
                    <button onClick={logout}>Выйти</button>
                </div>
                <h1>Список задач</h1>
            </div>
            <div className='task-list-container-sort'>
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
                <p style={{ color: 'var(--background-color', textAlign: "center" }}>{error}</p>
            ) : (
                <div className="task-list-container-group-wrapper">
                    {sortedGroupedTasks.map(([group, tasks]) => (
                        <div key={group} className="task-list-container-group">
                            {grouping !== "none" && (
                                <h2 onClick={() => toggleGroup(group)} style={{ cursor: "pointer" }}>
                                    {group} {expandedGroups[group] ? "▲" : "▼"}
                                </h2>
                            )}
                            <div className={`task-group-content ${grouping === "none" || expandedGroups[group] ? "open" : ""}`}>
                                {tasks.length === 0 ? (
                                    <div className="no-tasks-message">Задач нет</div>
                                ) : (
                                    <ul className="task-list-container-group-list">
                                        {tasks.map((task) => {
                                            const priorityColor = task.priority === "низкий"
                                                ? "var(--low-priority-color)"
                                                : task.priority === "средний"
                                                ? "var(--medium-priority-color)"
                                                : task.status === "отменена"
                                                ? "transparent"
                                                : "var(--high-priority-color)";
                                            const formatDate = (dateString: string) => {
                                                const date = new Date(dateString);
                                                const day = date.getDate();
                                                const month = date.toLocaleString("ru-RU", { month: "short" });
                                                const year = date.getFullYear();
                                                return `${day} ${month} ${year}`;
                                            };
                                            return (
                                                <li key={task.id} style={{ color: getTaskTitleColor(task) }} onClick={() => openTaskModal(task)}>
                                                    <h4>
                                                        <span className="task-item-title" style={{ backgroundColor: priorityColor }}></span>
                                                        {task.title}
                                                    </h4>
                                                    <div className="task-item-info">
                                                        <span className="task-item-info-duedate">{formatDate(task.due_date)}</span>
                                                        <span className="task-item-info-status">{task.status}</span>
                                                        <span className="task-item-info-responsible">
                                                            {task.assignee_id === user?.id 
                                                                ? "Моя задача" 
                                                                : task.first_name && task.last_name 
                                                                    ? `${task.last_name} ${task.first_name}` 
                                                                    : "Неизвестный"}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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