import { Task } from '../../types';

interface TaskItemProps {
    task: Task;
    onClick: (task: Task) => void;
    currentUserId: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onClick, currentUserId }) => {
    // Определяем цвет приоритета задачи
    const priorityColor = task.priority === 'низкий'
        ? 'var(--low-priority-color)'
        : task.priority === 'средний'
        ? 'var(--medium-priority-color)'
        : task.status === 'отменена'
        ? 'transparent'
        : 'var(--high-priority-color)';

    // Форматируем дату для отображения
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('ru-RU', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Определяем цвет заголовка задачи в зависимости от статуса и даты
    const getTaskTitleColor = (task: Task) => {
        const today = new Date().toISOString().split("T")[0];
        if (task.status === 'выполнена') return 'var(--done-tasks-color)';
        if (task.due_date < today && task.status !== 'отменена') return 'var(--overdue-tasks-color)';
        return 'var(--in-progress-tasks-color)';
    };

    return (
        <li 
            style={{ color: getTaskTitleColor(task) }} 
            onClick={() => onClick(task)} // Обработчик клика по задаче
        >
            <h4>
                <span 
                    className="task-item-title" 
                    style={{ backgroundColor: priorityColor }} // Цвет приоритета
                ></span>
                {task.title}
            </h4>
            <div className="task-item-info">
                <span className="task-item-info-duedate">{formatDate(task.due_date)}</span> {/* Дата выполнения */}
                <span className="task-item-info-status">{task.status}</span> {/* Статус задачи */}
                <span className="task-item-info-responsible">
                    {task.assignee_id === currentUserId 
                        ? 'Моя задача' 
                        : task.first_name && task.last_name 
                        ? `${task.last_name} ${task.first_name}` 
                        : 'Неизвестный'} {/* Ответственный */}
                </span>
            </div>
        </li>
    );
};