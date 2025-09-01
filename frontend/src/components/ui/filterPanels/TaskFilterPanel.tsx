import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Button, LoadingSpinner } from '../';
import CustomSelect from '../inputs/CustomSelect.tsx';
import CustomDateInput from '../inputs/CustomDateInput.tsx';
import type { ToDoTaskReadOnlyDTO } from '../../../types/api/dashboardInterface';

interface TaskFilterPanelProps {
    // Filter states
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;

    // Actions
    onClearFilters: () => void;

    // Results
    searchResults: ToDoTaskReadOnlyDTO[];
    loading: boolean;
    onUpdateTask: (task: ToDoTaskReadOnlyDTO) => void;
    onDeleteTask: (task: ToDoTaskReadOnlyDTO) => void;
    onCompleteTask: (taskId: number) => void;
    onRestoreTask: (taskId: number) => void;

    // Children (for rendering task results)
    children?: React.ReactNode;
}

const TaskFilterPanel: React.FC<TaskFilterPanelProps> = ({
                                                             statusFilter,
                                                             onStatusFilterChange,
                                                             dateFromFilter,
                                                             onDateFromFilterChange,
                                                             dateToFilter,
                                                             onDateToFilterChange,
                                                             onClearFilters,
                                                             loading,
                                                             children
                                                         }) => {
    // Status options for the filter
    const statusOptions = [
        { value: '', label: 'Όλα τα Tasks' },
        { value: 'PENDING', label: 'Εκκρεμούν' },
        { value: 'COMPLETED', label: 'Ολοκληρωμένα' }
    ];

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                        <CustomSelect
                            label="Κατάσταση"
                            value={statusFilter}
                            onChange={onStatusFilterChange}
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
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner/>
                        <span className="ml-3 text-gray-600">Φόρτωση tasks...</span>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default TaskFilterPanel;