import type {TaskItemProps} from "../../types/components/taskitem";
import {Button} from "./index.ts";

const TaskItem = ({ task , onComplete } : TaskItemProps) => {

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800'
    };
    return (
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{task.description}</p>
                <p className="text-sm text-gray-600">{task.date}</p>
            </div>
            <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
            statusColors[task.status as keyof typeof statusColors] || statusColors.PENDING
        }`}>
          {task.status}
        </span>
                {task.status === 'PENDING' && (
                    <Button
                        size="sm"
                        variant="success"
                        onClick={() => onComplete(task.id)}
                    >
                        ✓ Complete
                    </Button>
                )}
            </div>
        </div>
    );
}

export default TaskItem;