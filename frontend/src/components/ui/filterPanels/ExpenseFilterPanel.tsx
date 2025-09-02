import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Button, LoadingSpinner } from '../common';
import { CustomTextInput, CustomSelect, CustomDateInput } from '../inputs';
import { FaEuroSign } from "react-icons/fa6";
import { ExpenseFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { ExpenseCard } from '../resultCards';

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
            <div className="space-y-4">
                {/* Search Term */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomTextInput
                        label="Αναζήτηση με την περιγραφή"
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση με περιγραφή..."
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />

                    <CustomSelect
                        label="Τύπος Εξόδου"
                        value={expenseTypeFilter}
                        onChange={(value) => onExpenseTypeFilterChange(value as string)}
                        options={expenseTypeOptions}
                        placeholder=""
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
                {loading ? (
                    <div className="bg-white flex items-center justify-center p-8">
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
                    <div className="space-y-4">
                        {searchResults.map((expense) => (
                            <ExpenseCard
                                key={expense.id}
                                expense={expense}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseFilterPanel;