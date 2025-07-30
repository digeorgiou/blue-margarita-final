import React from 'react';
import { Search, Calendar, Eye, Edit, Trash2, DollarSign, Package, Filter } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomTextInput, CustomSelect, CustomDateInput } from '../inputs';
import type { ExpenseReadOnlyDTO, ExpenseTypeDTO } from '../../../types/api/expenseInterface';

interface ExpenseSearchBarProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    expenseTypeFilter: string;
    onExpenseTypeFilterChange: (value: string) => void;
    dateFromFilter: string;
    onDateFromFilterChange: (value: string) => void;
    dateToFilter: string;
    onDateToFilterChange: (value: string) => void;
    expenseTypes: ExpenseTypeDTO[];
    searchResults: ExpenseReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (expense: ExpenseReadOnlyDTO) => void;
    onEdit: (expense: ExpenseReadOnlyDTO) => void;
    onDelete: (expense: ExpenseReadOnlyDTO) => void;
    children?: React.ReactNode;
}

const ExpenseSearchBar: React.FC<ExpenseSearchBarProps> = ({
                                                               searchTerm,
                                                               onSearchTermChange,
                                                               expenseTypeFilter,
                                                               onExpenseTypeFilterChange,
                                                               dateFromFilter,
                                                               onDateFromFilterChange,
                                                               dateToFilter,
                                                               onDateToFilterChange,
                                                               expenseTypes,
                                                               searchResults,
                                                               loading,
                                                               onViewDetails,
                                                               onEdit,
                                                               onDelete,
                                                               children
                                                           }) => {

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('el-GR');
    };

    // Transform expense types for CustomSelect
    const expenseTypeOptions = [
        { value: '', label: 'Όλοι οι τύποι' },
        ...expenseTypes.map(type => ({
            value: type.value,
            label: type.displayName
        }))
    ];

    const clearFilters = () => {
        onSearchTermChange('');
        onExpenseTypeFilterChange('');
        onDateFromFilterChange('');
        onDateToFilterChange('');
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Search Term */}
                <CustomTextInput
                    label="Αναζήτηση στην περιγραφή εξόδου"
                    value={searchTerm}
                    onChange={onSearchTermChange}
                    placeholder="Αναζήτηση στην περιγραφή εξόδου..."
                    icon={<Search className="w-5 h-5 text-gray-400" />}
                />

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Expense Type Filter */}
                    <CustomSelect
                        label="Τύπος Εξόδου"
                        value={expenseTypeFilter}
                        onChange={(value) => onExpenseTypeFilterChange(value as string)}
                        options={expenseTypeOptions}
                    />

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

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                        <Button
                            onClick={clearFilters}
                            variant="outline-secondary"
                            className="w-full"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Καθαρισμός Φίλτρων
                        </Button>
                    </div>
                </div>
            </div>

            {/* Children section - Summary Card will be rendered here */}
            {children && (
                <div>
                    {children}
                </div>
            )}

            {/* Results Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner />
                        <span className="ml-2 text-gray-600">Φόρτωση εξόδων...</span>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν έξοδα</h3>
                        <p className="text-gray-600">Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {searchResults.map((expense) => (
                            <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {expense.description}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span>{formatDate(expense.expenseDate)}</span>
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {expense.expenseType}
                                                    </span>
                                                    {expense.purchaseId && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                                                            <Package className="w-3 h-3 mr-1" />
                                                            Αγορά
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(expense.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(expense)}
                                            variant="outline-secondary"
                                            size="sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(expense)}
                                            variant="outline-primary"
                                            size="sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(expense)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseSearchBar;