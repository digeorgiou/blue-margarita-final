import React from 'react';
import { Eye, Edit, Trash2, Calendar, CheckCircle, RotateCcw, Clock } from 'lucide-react';
import { Button } from '../';
import { formatDate } from '../../../utils/formatters';
import type { ToDoTaskReadOnlyDTO } from '../../../types/api/dashboardInterface';

interface TaskCardProps {
    task: ToDoTaskReadOnlyDTO;
    onViewDetails?: (task: ToDoTaskReadOnlyDTO) => void;
    onEdit: (task: ToDoTaskReadOnlyDTO) => void;
    onDelete: (task: ToDoTaskReadOnlyDTO) => void;
    onComplete: (taskId: number) => void;
    onRestore: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
                                               task,
                                               onViewDetails,
                                               onEdit,
                                               onDelete,
                                               onComplete,
                                               onRestore
                                           }) => {
    // Calculate days difference from today
    const today = new Date();
    const taskDate = new Date(task.date);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const getStatusColor = () => {
        const isOverdue = diffDays < 0 && task.status === 'PENDING';

        if (isOverdue) {
            return 'bg-red-100 text-red-800';
        }

        switch (task.status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusDisplayName = () => {
        switch (task.status) {
            case 'PENDING':
                return 'Εκκρεμεί';
            case 'COMPLETED':
                return 'Ολοκληρωμένο';
            case 'CANCELLED':
                return 'Ακυρωμένο';
            default:
                return task.status;
        }
    };

    const getDueDateInfo = () => {
        if (diffDays < 0) {
            return {
                text: `${Math.abs(diffDays)} ημέρες καθυστέρηση`,
                color: 'text-red-600 bg-red-100'
            };
        } else if (diffDays === 0) {
            return {
                text: 'Σήμερα',
                color: 'text-orange-600 bg-orange-100'
            };
        } else if (diffDays === 1) {
            return {
                text: 'Αύριο',
                color: 'text-blue-600 bg-blue-100'
            };
        } else {
            return {
                text: `Σε ${diffDays} ημέρες`,
                color: 'text-gray-600 bg-gray-100'
            };
        }
    };

    const dueDateInfo = getDueDateInfo();

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-4 py-1 rounded-full text-s font-semibold ${getStatusColor()}`}>
                                {getStatusDisplayName()}
                            </span>
                    </div>

                    <div className="ml-3 flex-shrink-0">
                        <Clock className="w-6 h-6 text-white/80" />
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Task Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <span className="text-md font-medium text-gray-700">
            {task.description}
        </span>
                    </div>

                    {/* Date Information */}
                    <div className="flex flex-col items-center justify-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-md text-gray-700">
                    <span className="font-medium">Ημερομηνία:</span> {formatDate(task.date)}
            </span>
                        </div>
                    </div>

                    {task.status === 'PENDING' && (
                        <div className="flex items-center justify-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-s font-semibold ${dueDateInfo.color}`}>
                        {dueDateInfo.text}
                    </span>
                        </div>
                    )}
                    {task.status === 'COMPLETED' && (
                        <div className="flex items-center justify-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-s font-semibold text-green-600 bg-green-100`}>
                            <span className="font-medium">Ολοκληρώθηκε:</span> {formatDate(task.dateCompleted)}
                        </span>
                        </div>
                    )}


                </div>
                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {/* Complete/Restore Button */}
                        {task.status === 'PENDING' ? (
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => onComplete(task.id)}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Ολοκλήρωση</span>
                            </Button>
                        ) : task.status === 'COMPLETED' ? (
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => onRestore(task.id)}
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Επαναφορά</span>
                            </Button>
                        ) : null}

                        {/* View Details Button (if provided) */}
                        {onViewDetails && (
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => onViewDetails(task)}
                            >
                                <Eye className="w-4 h-4" />
                                <span>Λεπτομέρειες</span>
                            </Button>
                        )}

                        {/* Edit Button */}
                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(task)}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        {/* Delete Button */}
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(task)}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Διαγραφή</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;