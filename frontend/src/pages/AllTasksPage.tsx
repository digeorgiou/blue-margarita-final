import React, { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import { dashboardService } from '../services/dashboardService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, CheckSquare } from 'lucide-react';
import type {
    ToDoTaskReadOnlyDTO,
    Paginated
} from '../types/api/dashboardInterface';

import TaskFilterPanel from '../components/ui/filterPanels/TaskFilterPanel';
import TaskModal from '../components/ui/modals/TaskModal';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';

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
    const [pageSize, setPageSize] = useState(20);
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

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
    const [successMessage, setSuccessMessage] = useState('');

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
    }, [currentPage, pageSize, sortBy, sortDirection, statusFilter, dateFromFilter, dateToFilter]);

    // PAGINATION HANDLERS
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page when changing page size
    };

    // FILTER HANDLERS
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
            setSuccessMessage('Το task ολοκληρώθηκε επιτυχώς!');
            setIsSuccessModalOpen(true);
            loadData(); // Reload tasks after completion
        } catch (err) {
            handleApiError(err, 'Failed to complete task');
        }
    };

    const handleRestoreTask = async (taskId: number) => {
        try {
            await dashboardService.restoreTask(taskId);
            setSuccessMessage('Το task επαναφέρθηκε επιτυχώς!');
            setIsSuccessModalOpen(true);
            loadData();
        } catch (err) {
            handleApiError(err, 'Failed to restore task');
        }
    };

    const confirmDeleteTask = async () => {
        if (!selectedTask) return;

        try {
            await dashboardService.deleteTask(selectedTask.id);
            setSuccessMessage('Το task διαγράφηκε επιτυχώς!');
            setIsSuccessModalOpen(true);
            setIsDeleteModalOpen(false);
            setSelectedTask(null);
            loadData(); // Reload tasks after deletion
        } catch (err) {
            setIsDeleteModalOpen(false);
            handleApiError(err, 'Failed to delete task');
        }
    };

    const handleTaskSubmit = async (taskData: { description: string; date: string }) => {
        try {
            if (modalMode === 'create') {
                await dashboardService.createTask(taskData);
                setSuccessMessage('Το task δημιουργήθηκε επιτυχώς!');
            } else if (modalMode === 'update' && selectedTask) {
                await dashboardService.updateTask(selectedTask.id, {
                    taskId: selectedTask.id,
                    description: taskData.description,
                    date: taskData.date
                });
                setSuccessMessage('Το task ενημερώθηκε επιτυχώς!');
            }

            setIsTaskModalOpen(false);
            setIsSuccessModalOpen(true);
            loadData(); // Refresh the task list
        } catch (err) {
            handleApiError(err, 'Failed to save task');
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">

                   <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                   </div>
                   <Button
                       onClick={handleCreateTask}
                       variant="create"
                       size="lg"
                       className={"w-full md:w-auto"}
                   >
                        <Plus className="w-5 h-5 mr-2" />
                        Νέο Task
                   </Button>

                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert
                        variant="error"
                        onClose={clearErrors}
                    />
                )}

                {/* Filter Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard className="shadow-lg">
                        <TaskFilterPanel
                            // Filter values
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            dateFromFilter={dateFromFilter}
                            onDateFromFilterChange={setDateFromFilter}
                            dateToFilter={dateToFilter}
                            onDateToFilterChange={setDateToFilter}

                            // Results and actions
                            searchResults={searchResults?.data || []}
                            loading={loading}
                            onCreateTask={handleCreateTask}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onCompleteTask={handleCompleteTask}
                            onRestoreTask={handleRestoreTask}
                            onClearFilters={handleClearFilters}
                            onRefresh={loadData}
                            onSort={handleSort}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                        />
                    </CustomCard>

                    {/* Pagination */}
                    {searchResults && searchResults.totalElements > 0 && (
                        <CustomCard title="" className="shadow-lg">
                            <div className="w-full overflow-x-auto">
                                <EnhancedPaginationControls
                                    paginationData={{
                                        currentPage: searchResults.currentPage,
                                        totalPages: searchResults.totalPages,
                                        totalElements: searchResults.totalElements,
                                        pageSize: searchResults.pageSize,
                                        numberOfElements: searchResults.numberOfElements
                                    }}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                                />
                            </div>
                        </CustomCard>
                    )}
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
                    onConfirm={confirmDeleteTask}
                    title="Διαγραφή Task"
                    message={`Είστε βέβαιοι ότι θέλετε να διαγράψετε το task "${selectedTask?.description}"?`}
                    confirmText="Διαγραφή"
                />

                <SuccessModal
                    title="Επιτυχία"
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    message={successMessage}
                />
            </div>
        </div>
    );
};

export default AllTasksPage;