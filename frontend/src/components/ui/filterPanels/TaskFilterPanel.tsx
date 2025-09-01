import React from 'react';
import { Button, LoadingSpinner } from '../';
import {CustomDateInput, CustomSelect} from '../inputs';
import {
    Calendar,
    Filter,
    RefreshCw,
    Check,
    RotateCcw,
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import type { ToDoTaskReadOnlyDTO } from '../../../types/api/dashboardInterface';

interface TaskFilterPanelProps {
    // Filter values
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;

    // Results and actions
    searchResults: ToDoTaskReadOnlyDTO[];
    loading: boolean;
    onCreateTask: () => void;
    onUpdateTask: (task: ToDoTaskReadOnlyDTO) => void;
    onDeleteTask: (task: ToDoTaskReadOnlyDTO) => void;
    onCompleteTask: (taskId: number) => void;
    onRestoreTask: (taskId: number) => void;
    onClearFilters: () => void;
    onRefresh: () => void;
    onSort: (field: string) => void;
    sortBy: string;
    sortDirection: 'ASC' | 'DESC';
}

const TaskFilterPanel: React.FC<TaskFilterPanelProps> = ({
                                                             statusFilter,
                                                             onStatusFilterChange,
                                                             dateFromFilter,
                                                             onDateFromFilterChange,
                                                             dateToFilter,
                                                             onDateToFilterChange,
                                                             searchResults,
                                                             loading,
                                                             onUpdateTask,
                                                             onDeleteTask,
                                                             onCompleteTask,
                                                             onRestoreTask,
                                                             onClearFilters,
                                                             onRefresh,
                                                             onSort,
                                                             sortBy,
                                                             sortDirection
                                                         }) => {
    // Helper functions
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR');
    };

    const formatTaskDate = (task: ToDoTaskReadOnlyDTO): string => {
        const date = formatDate(task.date);
        if (task.daysFromToday < 0) {
            return `${date} (${Math.abs(task.daysFromToday)} ημέρες καθυστέρηση)`;
        } else if (task.daysFromToday === 0) {
            return `${date} (Σήμερα)`;
        } else {
            return `${date} (σε ${task.daysFromToday} ημέρες)`;
        }
    };

    const formatTaskStatus = (task: ToDoTaskReadOnlyDTO): string => {
        if (task.statusLabel === 'OVERDUE') {
            return "Εκπρόθεσμο";
        } else if (task.statusLabel === 'TODAY') {
            return "Σήμερα";
        } else if (task.statusLabel === 'UPCOMING') {
            return "Επερχόμενο";
        } else if (task.status === 'COMPLETED') {
            return "Ολοκληρωμένο";
        } else if (task.status === 'CANCELLED') {
            return "Ακυρωμένο";
        } else {
            return "Εκκρεμές";
        }
    };

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

    const statusOptions = [
        { value: '', label: 'Όλες οι Κατηγορίες' },
        { value: 'PENDING', label: 'Εκκρεμούν' },
        { value: 'COMPLETED', label: 'Ολοκληρωμένα' }
    ];

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return null;
        return sortDirection === 'ASC' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                        {/*<label className="block text-sm font-medium text-gray-700 mb-1">*/}
                        {/*    Κατάσταση*/}
                        {/*</label>*/}
                        {/*<select*/}
                        {/*    value={statusFilter}*/}
                        {/*    onChange={(e) => onStatusFilterChange(e.target.value)}*/}
                        {/*    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"*/}
                        {/*>*/}
                        {/*    <option value="">Όλα</option>*/}
                        {/*    <option value="PENDING">Εκκρεμούν</option>*/}
                        {/*    <option value="COMPLETED">Ολοκληρωμένα</option>*/}
                        {/*</select>*/}

                        <CustomSelect
                            label="Κατάσταση"
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            options={statusOptions}
                            placeholder=""
                        />


                    </div>

                    {/* Date From Filter */}
                    <CustomDateInput
                        label="Από Ημερομηνία"
                        value={dateFromFilter}
                        onChange={onDateFromFilterChange}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />

                    {/* Date To Filter */}
                    <CustomDateInput
                        label="Έως Ημερομηνία"
                        value={dateToFilter}
                        onChange={onDateToFilterChange}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                    />

                    {/* Action Buttons */}
                    <div className="flex items-end">
                        <Button
                            onClick={onClearFilters}
                            variant="pink"
                            className="w-full h-14"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Δεν βρέθηκαν tasks</h3>
                        <p className="text-gray-600 mb-4">
                            {statusFilter || dateFromFilter || dateToFilter
                                ? 'Δοκιμάστε να αλλάξετε τα φίλτρα σας για να δείτε περισσότερα tasks.'
                                : 'Είστε ενημερωμένοι! Δεν υπάρχουν tasks για εμφάνιση.'}
                        </p>
                        <Button onClick={onClearFilters} variant="secondary">
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
                ) : (
                    <div>
                        {/* Tasks Header */}
                        <div className="bg-gray-50 border-b border-gray-200 p-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Tasks ({searchResults.length})
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => onSort('date')}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        <span>Ημερομηνία</span>
                                        {getSortIcon('date')}
                                    </Button>
                                    <Button
                                        onClick={() => onSort('description')}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center space-x-1"
                                    >
                                        <span>Περιγραφή</span>
                                        {getSortIcon('description')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="divide-y divide-gray-200">
                            {searchResults.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                                        {/* Task Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {task.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center space-x-4 mt-1">
                                                        <span className="text-sm text-gray-500">
                                                            {formatTaskDate(task)}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status, task.daysFromToday)}`}
                                                        >
                                                            {formatTaskStatus(task)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-2 lg:ml-4">
                                            {task.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => onCompleteTask(task.id)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Ολοκλήρωση</span>
                                                </Button>
                                            )}
                                            {task.status === 'COMPLETED' && (
                                                <Button
                                                    size="sm"
                                                    variant="warning"
                                                    onClick={() => onRestoreTask(task.id)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Επαναφορά</span>
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="teal"
                                                onClick={() => onUpdateTask(task)}
                                                className="flex items-center space-x-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span className="hidden sm:inline">Επεξεργασία</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => onDeleteTask(task)}
                                                className="flex items-center space-x-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Διαγραφή</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskFilterPanel;