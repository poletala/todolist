import { useState } from 'react';

import { Task } from '../../types';
import { TaskItem } from '../taskItem/TaskItem';

interface TaskGroupProps {
    groupName: string;
    tasks: Task[];
    currentUserId: number;
    onClick: (task: Task) => void;
    isCollapsible: boolean; // Можно ли сворачивать/разворачивать группу
    isInitiallyExpanded: boolean; // Начальное состояние группы (развернута/свернута)
}

export const TaskGroup: React.FC<TaskGroupProps> = ({ 
    groupName, 
    tasks, 
    currentUserId, 
    onClick, 
    isCollapsible,
    isInitiallyExpanded 
}) => {
    // Состояние для управления развернутостью группы
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

    // Если группа не сворачиваемая, то она всегда развернута
    const shouldShowContent = !isCollapsible || isExpanded;

    return (
        <div className="task-list-container-group">
            {/* Заголовок группы (отображается только если группа сворачиваемая) */}
            {isCollapsible && (
                <h2 
                    onClick={() => setIsExpanded((prev) => !prev)} // Обработчик клика для сворачивания/разворачивания
                    style={{ cursor: 'pointer' }}
                >
                    {groupName} {isExpanded ? '▲' : '▼'} {/* Индикатор состояния группы */}
                </h2>
            )}
            {/* Содержимое группы (задачи) */}
            <div className={`task-group-content ${shouldShowContent ? 'open' : ''}`}>
                {tasks.length === 0 ? (
                    <div className="no-tasks-message">Задач нет</div> 
                ) : (
                    <ul className="task-list-container-group-list">
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onClick={onClick}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};