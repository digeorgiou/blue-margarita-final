import React, { useState, useEffect } from 'react';
import { dashboardService } from "../../../services/dashboardService.ts";
import { Button, Card, LoadingSpinner, Input } from "../"
import TaskModal from "../modals/TaskModal.tsx";
import type { ToDoTaskReadOnlyDTO, Paginated } from "../../../types/api/dashboardInterface.ts";
import {Trash2, SquarePen, Check, RotateCcw, Plus, RefreshCw} from 'lucide-react'

interface TaskListProps {
    onNavigate: (page: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onNavigate }) => {
    const [data, setData] = useState<Paginated<ToDoTaskReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

    const[isModalOpen, setIsModalOpen] = useState(false);
    const[modalMode, setModalMode] = useState<'create' | 'update'> ('create');
    const[selectedTask, setSelectedTask] = useState<ToDoTaskReadOnlyDTO | null>(null);

    // Helper functions
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR');
    };

    const formatTaskDate = (task: ToDoTaskReadOnlyDTO): string => {
        const date = formatDate(task.date);
        if (task.daysFromToday < 0) {
            return `${date} (${Math.abs(task.daysFromToday)} days overdue)`;
        } else if (task.daysFromToday === 0) {
            return `${date} (Today)`;
        } else {
            return `${date} (in ${task.daysFromToday} days)`;
        }
    };

    const formatTaskStatus = (task : ToDoTaskReadOnlyDTO) : string => {
        if(task.statusLabel === 'OVERDUE'){
            return "Εκπρόθεσμο"
        } else if (task.statusLabel === 'TODAY'){
            return "Σήμερα"
        } else if (task.statusLabel === 'THIS_WEEK'){
            return "Εβδομάδας"
        } else {
            return "Μελλοντικό"
        }
    }

    const formatDaysInfo = (task: ToDoTaskReadOnlyDTO): React.ReactNode => {
        if (task.status === 'COMPLETED' && task.dateCompleted) {
            return (
                <span className="text-green-600 font-semibold">
                    Ολοκληρώθηκε {formatDate(task.dateCompleted)}
                </span>
            );
        }

        if (task.daysFromToday < 0) {
            return (
                <span className="text-red-600 font-semibold">
                    {Math.abs(task.daysFromToday)} μέρες πριν
                </span>
            );
        } else if (task.daysFromToday === 0) {
            return <span className="text-orange-600 font-semibold">Σήμερα</span>;
        } else {
            return (
                <span className="text-gray-600">
                    Σε {task.daysFromToday} μέρες
                </span>
            );
        }
    };

    const hasNext = data !== null ? data.currentPage + 1 < data.totalPages : false;
    const hasPrevious = data !== null ? data.currentPage > 0 : false;

    const getStatusColor = (status: string, daysFromToday: number) => {
        const isOverdue = daysFromToday < 0 && status === 'PENDING';

        if (isOverdue) {
            return 'bg-red-100 text-red-800';
        }

        switch (status) {
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

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                status: statusFilter || undefined,
                dateFrom: dateFromFilter || undefined,
                dateTo: dateToFilter || undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: sortBy,
                sortDirection: sortDirection
            };

            // Create clean params object (remove empty filters)
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) =>
                    value !== '' && value !== null && value !== undefined
                )
            );

            const response = await dashboardService.getAllTasks(cleanParams);
            setData(response);

        } catch (err) {
            setError('Failed to load tasks');
            console.error('Tasks error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load data when dependencies change
    useEffect(() => {
        loadData();
    }, [currentPage, sortBy, sortDirection, statusFilter, dateFromFilter, dateToFilter]);

    const handleClearFilters = () => {
        setStatusFilter('PENDING');
        setDateFromFilter('');
        setDateToFilter('');
        setCurrentPage(0);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
    };

    const handleCompleteTask = async (taskId: number) => {
        try {
            await dashboardService.completeTask(taskId);
            loadData(); // Reload tasks after completion
        } catch (err) {
            console.error('Failed to complete task:', err);
            alert('Failed to complete task. Please try again.');
        }
    };

    const handleRestoreTask = async (taskId: number) => {
        try {
            await dashboardService.restoreTask(taskId);
            loadData();
        } catch (err) {
            console.error('Failed to complete task:', err);
            alert('Failed to restore task. Please try again.');
        }
    }

    const handleUpdateTask = (task: ToDoTaskReadOnlyDTO) => {
        setSelectedTask(task);
        setModalMode('update');
        setIsModalOpen(true);
    };

    const handleDeleteTask = async (taskId: number) => {
        const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await dashboardService.deleteTask(taskId);
            loadData(); // Reload tasks after deletion
        } catch (err) {
            console.error('Failed to delete task:', err);
            alert('Failed to delete task. Please try again.');
        }
    };

    const handleAddNewTask = () => {
        setSelectedTask(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleTaskSubmit = async (taskData: { description: string; date: string }) => {
        try {
            if (modalMode === 'create') {
                await dashboardService.createTask(taskData);
            } else if (modalMode === 'update' && selectedTask) {
                await dashboardService.updateTask(selectedTask.id, {
                    taskId: selectedTask.id,
                    description: taskData.description,
                    date: taskData.date
                });
            }
            loadData(); // Refresh the task list
        } catch (err) {
            console.error('Failed to save task:', err);
            alert('Failed to save task. Please try again.');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">😵</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={loadData} variant="primary">
                            Προσπαθήστε ξανά
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">📋 Όλα τα tasks</h1>
                            <p className="text-gray-700 mt-1">Διαχειριστείτε τις εκκρεμότητες σας</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => onNavigate('dashboard')}
                                variant="secondary"
                            >
                                ← Επιστροφή στην Αρχική
                            </Button>
                            <Button
                                variant="success"
                                onClick={handleAddNewTask}
                            >
                                <Plus /> Προσθήκη Νέου Task
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Κατάσταση
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Όλα</option>
                                <option value="PENDING">Εκκρεμούν</option>
                                <option value="COMPLETED">Ολοκληρωμένα</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Από
                            </label>
                            <Input
                                type="date"
                                value={dateFromFilter}
                                onChange={(e) => setDateFromFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Έως
                            </label>
                            <Input
                                type="date"
                                value={dateToFilter}
                                onChange={(e) => setDateToFilter(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleClearFilters} variant="secondary" size="sm">
                                Καθαρισμός φίλτρων
                            </Button>
                            <Button
                                onClick={loadData}
                                variant="purple"
                                size="sm"
                                disabled={loading}
                            >
                                Ανανέωση Σελίδας
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                    </div>
                </div>

                {/* Results */}
                <Card title={`Σύνολο (${data?.totalElements || 0} tasks)`} icon="📋">
                    {data && data.data && data.data.length > 0 ? (
                        <>
                            {/* Table Header - Desktop */}
                            <div className="hidden md:grid md:grid-cols-5 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 mb-4">
                                <button
                                    onClick={() => handleSort('description')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Περιγραφή {sortBy === 'description' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <button
                                    onClick={() => handleSort('date')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Ημερομηνία {sortBy === 'date' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <button
                                    onClick={() => handleSort('status')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Status {sortBy === 'status' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <span>Ημέρες</span>
                                <span>Ενέργειες</span>
                            </div>

                            {/* Task List */}
                            <div className="space-y-3">
                                {data.data.map((task) => {
                                    const isOverdue = task.daysFromToday < 0 && task.status === 'PENDING';

                                    return (
                                        <div
                                            key={task.id}
                                            className={`p-4 rounded-lg border-l-4 ${
                                                isOverdue
                                                    ? 'bg-red-50 border-red-400'
                                                    : task.status === 'COMPLETED'
                                                        ? 'bg-green-50 border-green-400'
                                                        : 'bg-blue-50 border-blue-400'
                                            }`}
                                        >
                                            {/* Mobile Layout */}
                                            <div className="md:hidden">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{task.description}</p>
                                                        <p className="text-sm text-gray-600">{formatTaskDate(task)}</p>
                                                    </div>

                                                    {/* Mobile Action Buttons */}
                                                    <div className="flex gap-2 flex-wrap">
                                                        {task.status === 'PENDING' && (
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={() => handleCompleteTask(task.id)}
                                                            >
                                                                <Check />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleUpdateTask(task)}
                                                        >
                                                            <SquarePen />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleDeleteTask(task.id)}
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Mobile Days Info */}
                                                <div className="mb-2">
                                                    {formatDaysInfo(task)}
                                                </div>


                                            </div>

                                            {/* Desktop Layout */}
                                            <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{task.description}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-700">{formatDate(task.date)}</p>
                                                </div>
                                                <div>
                                                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(task.status, task.daysFromToday)}`}>
                                                        {formatTaskStatus(task)}
                                                    </span>
                                                </div>
                                                <div>
                                                    {formatDaysInfo(task)}
                                                </div>
                                                <div className="flex gap-1">
                                                    {task.status === 'PENDING' && (
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleCompleteTask(task.id)}
                                                        >
                                                            <Check />
                                                        </Button>
                                                    )}
                                                    {task.status === 'COMPLETED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => handleRestoreTask(task.id)}
                                                        >
                                                            <RotateCcw />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleUpdateTask(task)}
                                                    >
                                                        <SquarePen />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        Showing {(currentPage * pageSize) + 1} to {Math.min((currentPage + 1) * pageSize, data.totalElements)} of {data.totalElements} tasks
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={!hasPrevious}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Previous
                                        </Button>
                                        <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                                            Page {currentPage + 1} of {data.totalPages}
                                        </span>
                                        <Button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={!hasNext}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">✨</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
                            <p className="text-gray-600 mb-4">
                                {statusFilter || dateFromFilter || dateToFilter
                                    ? 'Try adjusting your filters or clearing them to see more tasks.'
                                    : 'You\'re all caught up! No tasks to display.'}
                            </p>
                            <Button onClick={handleClearFilters} variant="secondary">
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleTaskSubmit}
                mode={modalMode}
                initialData={selectedTask ? {
                    id: selectedTask.id,
                    description: selectedTask.description,
                    date: selectedTask.date
                } : undefined}
            />

        </div>
    );
};

export default TaskList;