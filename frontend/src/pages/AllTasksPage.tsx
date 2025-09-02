import React, { useState, useEffect } from 'react';
import { Button, Alert, CustomCard } from '../components/ui/common';
import { ConfirmDeleteModal, SuccessModal, TaskModal } from '../components/ui/modals';
import { TaskFilterPanel } from '../components/ui/filterPanels';
import { TaskCard } from '../components/ui/resultCards';
import { EnhancedPaginationControls } from "../components/ui/pagination";
import { dashboardService } from '../services/dashboardService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { DEFAULT_PAGE_SIZES} from "../constants/pagination.ts";
import { Plus } from 'lucide-react';
import type {
    ToDoTaskReadOnlyDTO,
    Paginated
} from '../types/api/dashboardInterface';

interface AllTasksPageProps {
    onNavigate: (page: string) => void;
}

const AllTasksPage: React.FC<AllTasksPageProps> = () => {
    // FILTER STATE
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.TASKS);

    // DATA STATE
    const [searchResults, setSearchResults] = useState<Paginated<ToDoTaskReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // ERROR HANDLING
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // MODAL STATES
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
    const [selectedTask, setSelectedTask] = useState<ToDoTaskReadOnlyDTO | null>(null);
    const [successMessage, setSuccessMessage] = useState({
        title: '',
        message: ''
    });

    // LOAD DATA FUNCTION
    const loadData = async () => {
        try {
            setLoading(true);
            clearErrors();

            const params = {
                status: statusFilter || undefined,
                dateFrom: dateFromFilter || undefined,
                dateTo: dateToFilter || undefined,
                page: currentPage,
                pageSize: pageSize
            };

            // Create clean params object (remove empty filters)
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) =>
                    value !== '' && value !== null && value !== undefined
                )
            );

            const response = await dashboardService.getAllTasks(cleanParams);
            setSearchResults(response);

        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    // EFFECT TO LOAD DATA
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, statusFilter, dateFromFilter, dateToFilter]);

    // FILTER HANDLERS
    const handleClearFilters = () => {
        setStatusFilter('PENDING');
        setDateFromFilter('');
        setDateToFilter('');
        setCurrentPage(0);
    };

    // TASK CRUD HANDLERS
    const handleCreateTask = () => {
        setSelectedTask(null);
        setModalMode('create');
        setIsTaskModalOpen(true);
    };

    const handleUpdateTask = (task: ToDoTaskReadOnlyDTO) => {
        setSelectedTask(task);
        setModalMode('update');
        setIsTaskModalOpen(true);
    };

    const handleDeleteTask = (task: ToDoTaskReadOnlyDTO) => {
        setSelectedTask(task);
        setIsDeleteModalOpen(true);
    };

    const handleCompleteTask = async (taskId: number) => {
        try {
            await dashboardService.completeTask(taskId);
            setSuccessMessage({
                title: 'Επιτυχής Ολοκλήρωση',
                message: 'Το task ολοκληρώθηκε επιτυχώς!'
            });
            setIsSuccessModalOpen(true);
            await loadData(); // Reload tasks after completion
        } catch (err) {
            handleApiError(err);
        }
    };

    const handleRestoreTask = async (taskId: number) => {
        try {
            await dashboardService.restoreTask(taskId);
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: 'Το task επαναφέρθηκε επιτυχώς!'
            });
            setIsSuccessModalOpen(true);
            await loadData();
        } catch (err) {
            handleApiError(err);
        }
    };

    const handleDeleteTaskConfirm = async () => {
        if (!selectedTask) return;

        try {
            await dashboardService.deleteTask(selectedTask.id);
            setIsDeleteModalOpen(false);
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: 'Το task διαγράφηκε επιτυχώς!'
            });
            setIsSuccessModalOpen(true);
            setSelectedTask(null);
            await loadData(); // Reload tasks after deletion
        } catch (err) {
            setIsDeleteModalOpen(false);
            handleApiError(err);
        }
    };

    const handleTaskSubmit = async (taskData: { description: string; date: string }) => {
        try {
            if (modalMode === 'create') {
                await dashboardService.createTask(taskData);
                setSuccessMessage({
                    title: 'Επιτυχής Δημιουργία',
                    message: 'Το task δημιουργήθηκε επιτυχώς!'
                });
            } else if (modalMode === 'update' && selectedTask) {
                await dashboardService.updateTask(selectedTask.id, {
                    taskId: selectedTask.id,
                    description: taskData.description,
                    date: taskData.date
                });
                setSuccessMessage({
                    title: 'Επιτυχής Ενημέρωση',
                    message: 'Το task ενημερώθηκε επιτυχώς!'
                });
            }

            setIsTaskModalOpen(false);
            setIsSuccessModalOpen(true);
            await loadData(); // Refresh the task list
        } catch (err) {
            handleApiError(err);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Success Alert */}
                {successMessage.title && (
                    <Alert
                        variant="success"
                        title={successMessage.title}
                        onClose={() => setSuccessMessage({ title: '', message: '' })}
                    />
                )}

                {/* Error Display */}
                {generalError && (
                    <Alert
                        variant="error"
                        onClose={clearErrors}
                    />
                )}

                {/* Header - Mobile responsive */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                    </div>
                    <Button
                        onClick={handleCreateTask}
                        variant="create"
                        size="lg"
                        className="w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Νέο Task
                    </Button>
                </div>

                {/* Filter Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard className="shadow-lg">
                        <TaskFilterPanel
                            statusFilter={statusFilter}
                            onStatusFilterChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(0); // Reset to first page
                            }}
                            dateFromFilter={dateFromFilter}
                            onDateFromFilterChange={(value) => {
                                setDateFromFilter(value);
                                setCurrentPage(0);
                            }}
                            dateToFilter={dateToFilter}
                            onDateToFilterChange={(value) => {
                                setDateToFilter(value);
                                setCurrentPage(0);
                            }}
                            onClearFilters={handleClearFilters}
                            searchResults={searchResults?.data || []}
                            loading={loading}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onCompleteTask={handleCompleteTask}
                            onRestoreTask={handleRestoreTask}
                        >
                            {/* Task Results */}
                            {searchResults && searchResults.totalElements > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid gap-4">
                                        {searchResults.data.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onEdit={handleUpdateTask}
                                                onDelete={handleDeleteTask}
                                                onComplete={handleCompleteTask}
                                                onRestore={handleRestoreTask}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : !loading ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">✨</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Δεν βρέθηκαν tasks</h3>
                                    <p className="text-gray-600 mb-4">
                                        {statusFilter !== 'PENDING' || dateFromFilter || dateToFilter
                                            ? 'Δοκιμάστε να αλλάξετε τα φίλτρα για να δείτε περισσότερα tasks.'
                                            : 'Είστε ενημερωμένοι! Δεν υπάρχουν tasks για εμφάνιση.'}
                                    </p>
                                    <Button onClick={handleClearFilters} variant="secondary">
                                        Καθαρισμός Φίλτρων
                                    </Button>
                                </div>
                            ) : null}
                        </TaskFilterPanel>
                    </CustomCard>

                    {/* Pagination Controls */}
                    {searchResults && searchResults.totalElements > 0 && (
                        <CustomCard className="shadow-lg">
                            <EnhancedPaginationControls
                                paginationData={{
                                    currentPage: searchResults.currentPage,
                                    totalPages: searchResults.totalPages,
                                    totalElements: searchResults.totalElements,
                                    pageSize: searchResults.pageSize,
                                    numberOfElements: searchResults.numberOfElements
                                }}
                                setCurrentPage={setCurrentPage}
                                setPageSize={setPageSize}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                            />
                        </CustomCard>
                    )}
                </div>
            </div>

            {/* Modals */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={handleTaskSubmit}
                mode={modalMode}
                initialData={selectedTask ? {
                    id: selectedTask.id,
                    description: selectedTask.description,
                    date: selectedTask.date
                } : undefined}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteTaskConfirm}
                title="Διαγραφή Task"
                message={`Είστε βέβαιοι ότι θέλετε να διαγράψετε το task "${selectedTask?.description}"?`}
                confirmText="Διαγραφή"
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
            />

            <SuccessModal
                title={successMessage.title}
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                message={successMessage.message}
            />
        </div>
    );
};

export default AllTasksPage;