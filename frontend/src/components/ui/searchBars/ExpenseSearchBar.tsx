import React from 'react';
import { Search, Calendar, Eye, Edit, Trash2, DollarSign, Package } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
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
    isPurchaseFilter: boolean | null;
    onIsPurchaseFilterChange: (value: boolean | null) => void;
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
                                                               isPurchaseFilter,
                                                               onIsPurchaseFilterChange,
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

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Search Term */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Αναζήτηση στην περιγραφή εξόδου..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Expense Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Τύπος Εξόδου
                        </label>
                        <select
                            value={expenseTypeFilter}
                            onChange={(e) => onExpenseTypeFilterChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Όλοι οι τύποι</option>
                            {Array.isArray(expenseTypes) && expenseTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date From Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Από Ημερομηνία
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateFromFilter}
                                onChange={(e) => onDateFromFilterChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Date To Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Έως Ημερομηνία
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateToFilter}
                                onChange={(e) => onDateToFilterChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Purchase Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Σύνδεση με Αγορά
                        </label>
                        <select
                            value={isPurchaseFilter === null ? '' : isPurchaseFilter.toString()}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                    onIsPurchaseFilterChange(null);
                                } else {
                                    onIsPurchaseFilterChange(value === 'true');
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Όλα τα έξοδα</option>
                            <option value="true">Με σύνδεση αγοράς</option>
                            <option value="false">Χωρίς σύνδεση αγοράς</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                        <Button
                            onClick={() => {
                                onSearchTermChange('');
                                onExpenseTypeFilterChange('');
                                onDateFromFilterChange('');
                                onDateToFilterChange('');
                                onIsPurchaseFilterChange(null);
                            }}
                            variant="outline-secondary"
                            className="w-full"
                        >
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
                    <div className="text-center py-8 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>Δεν βρέθηκαν έξοδα με τα τρέχοντα κριτήρια αναζήτησης</p>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {searchResults.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="space-y-3">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {expense.description}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(expense.expenseDate)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900">
                                                    {formatCurrency(expense.amount)}
                                                </div>
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                    expense.purchaseId
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {expense.expenseType}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Purchase Link Info */}
                                        {expense.purchaseId && expense.purchaseDescription && (
                                            <div className="bg-blue-50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Package className="w-4 h-4 text-blue-600" />
                                                    <span className="text-blue-600 font-medium">
                                                        Συνδεδεμένο με αγορά:
                                                    </span>
                                                    <span className="text-blue-900">
                                                        {expense.purchaseDescription}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="text-xs text-gray-500 border-t pt-2">
                                            Δημιουργήθηκε: {formatDate(expense.createdAt)} από {expense.createdBy}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                onClick={() => onViewDetails(expense)}
                                                variant="outline-primary"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Προβολή
                                            </Button>
                                            <Button
                                                onClick={() => onEdit(expense)}
                                                variant="outline-secondary"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Επεξεργασία
                                            </Button>
                                            <Button
                                                onClick={() => onDelete(expense)}
                                                variant="danger"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Διαγραφή
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

export default ExpenseSearchBar;