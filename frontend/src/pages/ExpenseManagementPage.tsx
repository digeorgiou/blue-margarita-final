import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import { expenseService } from '../services/expenseService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, DollarSign, BarChart3, Calendar, Filter } from 'lucide-react';
import type {
    ExpenseReadOnlyDTO,
    ExpenseInsertDTO,
    ExpenseUpdateDTO,
    PaginatedFilteredExpensesWithSummary,
    ExpenseTypeBreakdownDTO,
    ExpenseTypeDTO
} from '../types/api/expenseInterface';

import ExpenseSearchBar from '../components/ui/searchBars/ExpenseSearchBar';
import ExpenseDetailModal from '../components/ui/modals/expense/ExpenseDetailModal';
import ExpenseUpdateModal from '../components/ui/modals/expense/ExpenseUpdateModal';
import ExpenseCreateModal from '../components/ui/modals/expense/ExpenseCreateModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';

const ExpenseManagementPage = () => {
    // Toggle state for switching between main page and analytics
    const [currentView, setCurrentView] = useState<'main' | 'analytics'>('main');

    // MAIN PAGE STATE
    // Search and pagination state for main expense listing
    const [searchTerm, setSearchTerm] = useState('');
    const [expenseTypeFilter, setExpenseTypeFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [isPurchaseFilter, setIsPurchaseFilter] = useState<boolean | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<PaginatedFilteredExpensesWithSummary | null>(null);
    const [loading, setLoading] = useState(false);

    // ANALYTICS PAGE STATE
    // Date filters for expense breakdown
    const [analyticsDateFrom, setAnalyticsDateFrom] = useState('');
    const [analyticsDateTo, setAnalyticsDateTo] = useState('');
    const [breakdownData, setBreakdownData] = useState<ExpenseTypeBreakdownDTO[]>([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // SHARED STATE
    // Dropdown data
    const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeDTO[]>([]);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Selected items for modals
    const [selectedExpense, setSelectedExpense] = useState<ExpenseReadOnlyDTO | null>(null);
    const [expenseDetails, setExpenseDetails] = useState<ExpenseReadOnlyDTO | null>(null);

    // Get current user ID (you'll need to implement this based on your auth system)
    const getCurrentUserId = (): number => {
        // This should get the current user ID from your auth context/service
        return 1; // Placeholder
    };

    // =============================================================================
    // INITIALIZATION
    // =============================================================================

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const expenseTypes = await expenseService.getExpenseTypes();
            setExpenseTypes(expenseTypes);
        } catch (error) {
            console.error('Error loading expense types:', error); // Debug log
            handleApiError(error);
        }
    };

    // =============================================================================
    // MAIN PAGE METHODS
    // =============================================================================

    // Load expenses with current filters
    useEffect(() => {
        if (currentView === 'main') {
            loadExpenses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentView, searchTerm, expenseTypeFilter, dateFromFilter, dateToFilter, isPurchaseFilter, currentPage, pageSize]);

    const loadExpenses = async () => {
        if (currentView !== 'main') return;

        setLoading(true);
        clearErrors();

        try {
            const filters = {
                description: searchTerm || undefined,
                expenseType: expenseTypeFilter || undefined,
                expenseDateFrom: dateFromFilter || undefined,
                expenseDateTo: dateToFilter || undefined,
                isPurchase: isPurchaseFilter ?? undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: 'expenseDate',
                sortDirection: 'DESC' as const
            };

            const results = await expenseService.searchExpensesWithSummary(filters);
            setSearchResults(results);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination handlers
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0);
    };

    // Filter reset
    const handleResetFilters = () => {
        setSearchTerm('');
        setExpenseTypeFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setIsPurchaseFilter(null);
        setCurrentPage(0);
    };

    // =============================================================================
    // ANALYTICS PAGE METHODS
    // =============================================================================

    useEffect(() => {
        if (currentView === 'analytics') {
            loadExpenseBreakdown();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentView, analyticsDateFrom, analyticsDateTo]);

    const loadExpenseBreakdown = async () => {
        if (currentView !== 'analytics') return;

        setAnalyticsLoading(true);
        try {
            const filters = {
                dateFrom: analyticsDateFrom || undefined,
                dateTo: analyticsDateTo || undefined
            };

            const data = await expenseService.getExpenseBreakdownByType(filters);
            setBreakdownData(data);
        } catch (error) {
            handleApiError(error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // =============================================================================
    // CRUD HANDLERS
    // =============================================================================

    const handleCreateExpense = async (expenseData: ExpenseInsertDTO) => {
        await expenseService.createExpense({
            ...expenseData,
            creatorUserId: getCurrentUserId()
        });
        setIsCreateModalOpen(false);
        setSuccessMessage('Το έξοδο δημιουργήθηκε επιτυχώς!');
        setIsSuccessModalOpen(true);
        loadExpenses();
    };

    const handleUpdateExpense = async (expenseData: ExpenseUpdateDTO) => {
        if (!selectedExpense) return;

        await expenseService.updateExpense(selectedExpense.id, {
            ...expenseData,
            updaterUserId: getCurrentUserId()
        });
        setIsUpdateModalOpen(false);
        setSuccessMessage('Το έξοδο ενημερώθηκε επιτυχώς!');
        setIsSuccessModalOpen(true);
        loadExpenses();
    };

    const handleDeleteExpense = async () => {
        if (!selectedExpense) return;

        try {
            await expenseService.deleteExpense(selectedExpense.id);
            setIsDeleteModalOpen(false);
            setSuccessMessage('Το έξοδο διαγράφηκε επιτυχώς!');
            setIsSuccessModalOpen(true);
            loadExpenses();
        } catch (error) {
            handleApiError(error);
        }
    };

    // Modal handlers
    const handleViewDetails = (expense: ExpenseReadOnlyDTO) => {
        setExpenseDetails(expense);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (expense: ExpenseReadOnlyDTO) => {
        setSelectedExpense(expense);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (expense: ExpenseReadOnlyDTO) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('el-GR').format(num);
    };

    // =============================================================================
    // RENDER
    // =============================================================================

    return (
        <div className="space-y-6">
            {/* Header with Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        Διαχείριση Εξόδων
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {currentView === 'main'
                            ? 'Διαχείριση και παρακολούθηση όλων των εξόδων της επιχείρησης'
                            : 'Ανάλυση εξόδων ανά τύπο και χρονική περίοδο'
                        }
                    </p>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setCurrentView('main')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                            currentView === 'main'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <DollarSign className="w-4 h-4" />
                        Διαχείριση
                    </button>
                    <button
                        onClick={() => setCurrentView('analytics')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                            currentView === 'analytics'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Ανάλυση
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {generalError && (
                <Alert variant="error" className="mb-4">
                    {generalError}
                </Alert>
            )}

            {/* MAIN VIEW - Expense Management */}
            {currentView === 'main' && (
                <>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Νέο Έξοδο
                        </Button>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleResetFilters}
                                variant="outline-primary"
                                className="flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Καθαρισμός Φίλτρων
                            </Button>
                        </div>
                    </div>

                    {/* Search and Results */}
                    <DashboardCard
                        title="Αναζήτηση και Αποτελέσματα"
                    >
                        <div className="mb-4 text-sm text-gray-600">
                            {searchResults
                                ? `Εμφάνιση ${searchResults.numberOfElements} από ${searchResults.totalElements} έξοδα`
                                : 'Φόρτωση...'
                            }
                        </div>
                        <ExpenseSearchBar
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            expenseTypeFilter={expenseTypeFilter}
                            onExpenseTypeFilterChange={setExpenseTypeFilter}
                            dateFromFilter={dateFromFilter}
                            onDateFromFilterChange={setDateFromFilter}
                            dateToFilter={dateToFilter}
                            onDateToFilterChange={setDateToFilter}
                            isPurchaseFilter={isPurchaseFilter}
                            onIsPurchaseFilterChange={setIsPurchaseFilter}
                            expenseTypes={expenseTypes || []}
                            searchResults={searchResults?.data || []}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </DashboardCard>

                    {/* Summary Card */}
                    {searchResults?.summary && (
                        <DashboardCard
                            title="Σύνοψη Αποτελεσμάτων"
                        >
                            <div className="mb-4 text-sm text-gray-600">
                                Συγκεντρωτικά στοιχεία για τα φιλτραρισμένα έξοδα
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm text-blue-600 font-medium">Συνολικά Έξοδα</div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {formatCurrency(searchResults.summary.totalAmount)}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        {formatNumber(searchResults.summary.totalCount)} καταχωρήσεις
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-sm text-green-600 font-medium">Μέσος Όρος</div>
                                    <div className="text-2xl font-bold text-green-900">
                                        {formatCurrency(searchResults.summary.averageAmount)}
                                    </div>
                                    <div className="text-xs text-green-600">ανά έξοδο</div>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="text-sm text-orange-600 font-medium">Πλήθος Εγγραφών</div>
                                    <div className="text-2xl font-bold text-orange-900">
                                        {formatNumber(searchResults.summary.totalCount)}
                                    </div>
                                    <div className="text-xs text-orange-600">στα φιλτραρισμένα αποτελέσματα</div>
                                </div>
                            </div>
                        </DashboardCard>
                    )}

                    {/* Pagination Controls */}
                    {searchResults && searchResults.totalElements > 0 && (
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
                    )}
                </>
            )}

            {/* ANALYTICS VIEW - Expense Breakdown */}
            {currentView === 'analytics' && (
                <>
                    {/* Date Filters */}
                    <DashboardCard
                        title="Φίλτρα Ανάλυσης"
                    >
                        <div className="mb-4 text-sm text-gray-600">
                            Επιλέξτε χρονική περίοδο για ανάλυση εξόδων
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Από Ημερομηνία
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={analyticsDateFrom}
                                        onChange={(e) => setAnalyticsDateFrom(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Έως Ημερομηνία
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={analyticsDateTo}
                                        onChange={(e) => setAnalyticsDateTo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Expense Type Breakdown */}
                    <DashboardCard
                        title="Ανάλυση Εξόδων ανά Τύπο"
                    >
                        <div className="mb-4 text-sm text-gray-600">
                            Κατανομή εξόδων και ποσοστά για την επιλεγμένη περίοδο
                        </div>
                        {analyticsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-gray-500">Φόρτωση ανάλυσης...</div>
                            </div>
                        ) : breakdownData.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Δεν βρέθηκαν δεδομένα για την επιλεγμένη περίοδο
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {breakdownData.map((item) => (
                                    <div key={item.expenseType} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {item.expenseTypeDisplayName}
                                                </h3>
                                                <div className="text-sm text-gray-600">
                                                    {formatNumber(item.count)} καταχωρήσεις
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {formatCurrency(item.totalAmount)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {item.percentage.toFixed(1)}% του συνόλου
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-32">
                                                    <div className="bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Total Summary */}
                                <div className="border-t pt-4 mt-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-blue-900">Σύνολο Περιόδου</h3>
                                                <div className="text-sm text-blue-600">
                                                    {formatNumber(breakdownData.reduce((sum, item) => sum + item.count, 0))} συνολικές καταχωρήσεις
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-900">
                                                    {formatCurrency(breakdownData.reduce((sum, item) => sum + item.totalAmount, 0))}
                                                </div>
                                                <div className="text-sm text-blue-600">100% του συνόλου</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DashboardCard>
                </>
            )}

            {/* MODALS */}
            <ExpenseCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateExpense}
                expenseTypes={expenseTypes || []}
            />

            <ExpenseUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateExpense}
                expense={selectedExpense}
                expenseTypes={expenseTypes || []}
            />

            <ExpenseDetailModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                expense={expenseDetails}
                loading={false}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteExpense}
                title="Διαγραφή Εξόδου"
                message={selectedExpense ?
                    `Είστε βέβαιοι ότι θέλετε να διαγράψετε το έξοδο "${selectedExpense.description}"?` :
                    'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το έξοδο;'
                }
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Επιτυχία"
                message={successMessage}
            />
        </div>
    );
};

export default ExpenseManagementPage;