import React from 'react';
import { Search, Calendar, Eye, Edit, Trash2, Package, Filter } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import { CustomTextInput, CustomSelect, CustomDateInput } from '../inputs';
import { FaEuroSign } from "react-icons/fa6";
import { ExpenseFilterPanelProps } from "../../../types/components/filterPanel-types.ts";

const ExpenseFilterPanel: React.FC<ExpenseFilterPanelProps> = ({
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

    const getExpenseTypeDisplayName = (expenseTypeValue: string): string => {
        const expenseType = expenseTypes.find(type => type.value === expenseTypeValue);
        return expenseType ? expenseType.displayName : expenseTypeValue;
    };

    const clearFilters = () => {
        onSearchTermChange('');
        onExpenseTypeFilterChange('');
        onDateFromFilterChange('');
        onDateToFilterChange('');
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Term */}
                <div className="flex-1">
                    <CustomTextInput
                        label="Αναζήτηση με την περιγραφή"
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση με περιγραφή..."
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Expense Type Filter */}
                    <CustomSelect
                        label="Τύπος Εξόδου"
                        value={expenseTypeFilter}
                        onChange={(value) => onExpenseTypeFilterChange(value as string)}
                        options={expenseTypeOptions}
                        placeholder=""
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
                            variant="pink"
                            className="w-full"
                        >
                            <Filter className="w-5 h-9 mr-2" />
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
                    <div className="p-8 text-center">
                        <LoadingSpinner />
                        <span className="mt-4 text-gray-600">Φόρτωση εξόδων...</span>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <FaEuroSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν έξοδα</h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() ? 'Δεν βρέθηκαν έξοδα που να ταιριάζουν με τα κριτήρια αναζήτησης. Δοκιμάστε να αλλάξετε φίλτρα.'
                                : 'Δεν υπάρχουν αποθηκευμένα έξοδα.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {searchResults.map((expense) => (
                            <div key={expense.id}
                                 className="p-6 hover:bg-blue-100 transition-colors duration-150">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <FaEuroSign className="w-5 h-5 text-purple-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {expense.description}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <span>{formatDate(expense.expenseDate)}</span>
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {getExpenseTypeDisplayName(expense.expenseType)}
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
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(expense)}
                                            variant="info"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Λεπτομέρειες
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(expense)}
                                            variant="teal"
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
                )}
            </div>
        </div>
    );
};

export default ExpenseFilterPanel;