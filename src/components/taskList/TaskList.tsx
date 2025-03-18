import { useMemo } from 'react';

import { GroupingType, Task } from '../../types';
import { TaskGroup } from '../taskGroup/TaskGroup';


interface TaskListProps {
    tasks: Task[];
    grouping: GroupingType;
    currentUserId: number;
    onClick: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ 
    tasks, 
    grouping, 
    currentUserId, 
    onClick 
}) => {
    // Функция для группировки задач
    const groupTasks = (tasks: Task[], grouping: GroupingType, currentUserId: number) => {
        const today = new Date().toISOString().split("T")[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        switch (grouping) {
            case 'date':
                return {
                    'На сегодня': tasks.filter((task) => task.due_date === today),
                    'На неделю': tasks.filter((task) => task.due_date > today && task.due_date <= nextWeek),
                    'На будущее': tasks.filter((task) => task.due_date > nextWeek),
                };
            case 'responsible':
                return tasks.reduce((acc, task) => {
                    const groupName = task.assignee_id === currentUserId 
                        ? 'Мои задачи' 
                        : `${task.first_name || ''} ${task.last_name || ''}`.trim();
                    if (!acc[groupName]) acc[groupName] = [];
                    acc[groupName].push(task);
                    return acc;
                }, {} as Record<string, Task[]>);
            case "none":
            default:
                return { 'Все задачи': tasks };
        }
    };

    // Сортируем задачи по дате обновления
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }, [tasks]);

    // Группируем задачи
    const groupedTasks = useMemo(() => {
        const grouped = groupTasks(sortedTasks, grouping, currentUserId);
        // Сортируем задачи внутри каждой группы по дате обновления
        Object.keys(grouped).forEach((groupName) => {
            grouped[groupName] = grouped[groupName].sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
        });
        return grouped;
    }, [sortedTasks, grouping, currentUserId]);

    // Сортируем группы: "Мои задачи" всегда первые
    const sortedGroupedTasks = useMemo(() => {
        return Object.entries(groupedTasks).sort(([groupName]) => {
            return groupName === 'Мои задачи' ? -1 : 1;
        });
    }, [groupedTasks]);

    return (
        <div className="task-list-container-group-wrapper">
            {sortedGroupedTasks.map(([groupName, tasks]) => (
                <TaskGroup
                    key={groupName}
                    groupName={groupName}
                    tasks={tasks}
                    currentUserId={currentUserId}
                    onClick={onClick}
                    isCollapsible={grouping !== 'none'} // Группы сворачиваются только при группировке
                    isInitiallyExpanded={grouping === 'none'} // Группы развернуты только при "Все задачи"
                />
            ))}
        </div>
    );
};