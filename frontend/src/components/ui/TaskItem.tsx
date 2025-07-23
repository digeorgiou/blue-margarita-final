import type {TaskItemProps} from "../../types/components/taskitem";
import {Button} from "./index.ts";

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
    // Determine if task is overdue (assuming date format includes overdue info)
    const isOverdue = task.date.includes('Πριν');
    const isToday = task.date.includes('Σήμερα');

    return (
        <div className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${
            isOverdue
                ? 'bg-red-50 border-red-400'
                : isToday
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-gray-50 border-blue-400'
        }`}>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{task.description}</p>
                <p className={`text-sm ${
                    isOverdue
                        ? 'text-red-600 font-medium'
                        : isToday
                            ? 'text-orange-600 font-medium'
                            : 'text-gray-600'
                }`}>
                    {task.date}
                </p>
            </div>

            {/* Only show complete button for pending tasks */}
            {task.status === 'PENDING' && (
                <Button
                    size="sm"
                    variant="success"
                    onClick={() => onComplete(task.id)}
                >
                    ✓ Ολοκλήρωση
                </Button>
            )}
        </div>
    );
};

export default TaskItem;