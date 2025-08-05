import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import { expenseService } from '../services/expenseService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, BarChart3, Calendar, Filter, Search } from 'lucide-react';
import { FaEuroSign } from "react-icons/fa6";
import type {
    ExpenseReadOnlyDTO,
    ExpenseInsertDTO,
    ExpenseUpdateDTO,
    PaginatedFilteredExpensesWithSummary,
    ExpenseTypeBreakdownDTO,
    ExpenseTypeDTO
} from '../types/api/expenseInterface';

// Import custom components
import { ExpenseFilterPanel } from '../components/ui/filterPanels'
import { CustomDateInput } from '../components/ui/inputs';
import ExpenseDetailModal from '../components/ui/modals/expense/ExpenseDetailModal';
import ExpenseUpdateModal from '../components/ui/modals/expense/ExpenseUpdateModal';
import ExpenseCreateModal from '../components/ui/modals/expense/ExpenseCreateModal';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';
import { getExpenseTypeDisplayName } from "../utils/EnumUtils.ts";

const ExpenseManagementPage = () => {
    // Toggle state for switching between main page and analytics
    const [currentView, setCurrentView] = useState<'main' | 'analytics'>('main');

    // MAIN PAGE STATE
    // Search and pagination state for main expense listing
    const [searchTerm, setSearchTerm] = useState('');
    const [expenseTypeFilter, setExpenseTypeFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<PaginatedFilteredExpensesWithSummary | null>(null);
    const [loading, setLoading] = useState(false);

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

    // Selected expense state
    const [selectedExpense, setSelectedExpense] = useState<ExpenseReadOnlyDTO | null>(null);
    const [expenseDetails, setExpenseDetails] = useState<ExpenseReadOnlyDTO | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    // ANALYTICS VIEW STATE
    const [analyticsDateFrom, setAnalyticsDateFrom] = useState('');
    const [analyticsDateTo, setAnalyticsDateTo] = useState('');
    const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseTypeBreakdownDTO[]>([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // =============================================================================
    // LIFECYCLE METHODS
    // =============================================================================

    useEffect(() => {
        loadExpenseTypes();
        loadExpenses();
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (currentView === 'main') {
            loadExpenses();
        } else {
            loadAnalytics();
        }
    }, [currentView, searchTerm, expenseTypeFilter, dateFromFilter, dateToFilter]);

    // =============================================================================
    // DATA LOADING METHODS
    // =============================================================================

    const loadExpenseTypes = async () => {
        try {
            const types = await expenseService.getExpenseTypes();
            setExpenseTypes(types);
        } catch (error) {
            handleApiError(error);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            clearErrors();

            const filters = {
                description: searchTerm || undefined,
                expenseType: expenseTypeFilter || undefined,
                expenseDateFrom: dateFromFilter || undefined,
                expenseDateTo: dateToFilter || undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: 'expenseDate',
                sortDirection: 'DESC' as const
            };

            const result = await expenseService.searchExpensesWithSummary(filters);
            setSearchResults(result);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            clearErrors();

            const filters = {
                dateFrom: analyticsDateFrom || undefined,
                dateTo: analyticsDateTo || undefined
            };

            const breakdown = await expenseService.getExpenseBreakdownByType(filters);
            setExpenseBreakdown(breakdown);
        } catch (error) {
            handleApiError(error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const getCurrentUserId = (): number => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.id;
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return 1;
    };

    // =============================================================================
    // CRUD OPERATIONS
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
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Toggle */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FaEuroSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Διαχείριση Εξόδων</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* View Toggle Buttons */}
                            <div className="flex bg-purple-600 rounded-lg p-1">
                                <button
                                    onClick={() => setCurrentView('main')}
                                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                                        currentView === 'main'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-white hover:text-blue-100'
                                    }`}
                                >
                                    <FaEuroSign className="w-4 h-4" />
                                    Διαχείριση
                                </button>
                                <button
                                    onClick={() => setCurrentView('analytics')}
                                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                                        currentView === 'analytics'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-white hover:text-blue-100'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Ανάλυση
                                </button>
                            </div>

                            {/* Create Button */}

                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    variant="create"
                                    size="lg"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Νέο Έξοδο
                                </Button>

                        </div>
                    </div>


                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                {/* MAIN VIEW - Expense Management */}
                {currentView === 'main' && (
                    <>
                        {/* Pagination Controls - Top */}
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
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                                />
                            </CustomCard>
                        )}

                        {/* Search and Filter Section */}
                        <CustomCard
                            title="Φίλτρα"
                            icon={<Search className="w-5 h-5" />}
                            className="shadow-lg"
                        >
                            <ExpenseFilterPanel
                                searchTerm={searchTerm}
                                onSearchTermChange={setSearchTerm}
                                expenseTypeFilter={expenseTypeFilter}
                                onExpenseTypeFilterChange={setExpenseTypeFilter}
                                dateFromFilter={dateFromFilter}
                                onDateFromFilterChange={setDateFromFilter}
                                dateToFilter={dateToFilter}
                                onDateToFilterChange={setDateToFilter}
                                expenseTypes={expenseTypes}
                                searchResults={searchResults?.data || []}
                                loading={loading}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            >
                                {/* Summary Card */}
                                {searchResults?.summary && (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                            Σύνοψη Αποτελεσμάτων
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {formatNumber(searchResults.summary.totalCount)}
                                                </div>
                                                <div className="text-sm text-gray-600">Συνολικά Έξοδα</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {formatCurrency(searchResults.summary.totalAmount)}
                                                </div>
                                                <div className="text-sm text-gray-600">Συνολικό Ποσό</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {formatCurrency(searchResults.summary.averageAmount)}
                                                </div>
                                                <div className="text-sm text-gray-600">Μέσος Όρος</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* No Summary Warning */}
                                {searchResults && !searchResults.summary && searchResults.totalElements > 100 && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700">
                                                    <strong>Πάρα πολλά αποτελέσματα για σύνοψη:</strong> Βρέθηκαν {formatNumber(searchResults.totalElements)} έξοδα.
                                                    Η σύνοψη εμφανίζεται μόνο για ≤100 αποτελέσματα για λόγους απόδοσης.
                                                </p>
                                                <p className="text-sm text-yellow-600">
                                                    💡 <strong>Συμβουλή:</strong> Περιορίστε τα φίλτρα σας (π.χ. ημερομηνίες, τύπος εξόδου) για να δείτε τη σύνοψη.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ExpenseFilterPanel>
                        </CustomCard>
                    </>
                )}

                {/* ANALYTICS VIEW - Expense Breakdown */}
                {currentView === 'analytics' && (
                    <CustomCard
                        title="Ανάλυση Εξόδων"
                        icon={<BarChart3 className="w-5 h-5" />}
                        className="shadow-lg"
                    >
                        <div className="space-y-6">
                            {/* Analytics Filters */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <CustomDateInput
                                        label="Από Ημερομηνία"
                                        value={analyticsDateFrom}
                                        onChange={setAnalyticsDateFrom}
                                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                                    />
                                    <CustomDateInput
                                        label="Έως Ημερομηνία"
                                        value={analyticsDateTo}
                                        onChange={setAnalyticsDateTo}
                                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            onClick={() => {
                                                setAnalyticsDateFrom('');
                                                setAnalyticsDateTo('');
                                            }}
                                            variant="pink"
                                            className="w-full"
                                        >
                                            <Filter className="w-5 h-8 mr-2" />
                                            Καθαρισμός Φίλτρων
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Results */}
                            {analyticsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Φόρτωση ανάλυσης...</span>
                                </div>
                            ) : expenseBreakdown.length === 0 ? (
                                <div className="text-center py-12">
                                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν δεδομένα</h3>
                                    <p className="text-gray-600">Δοκιμάστε να αλλάξετε το εύρος ημερομηνιών</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {expenseBreakdown.map((breakdown, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-gray-900">{getExpenseTypeDisplayName(breakdown.expenseType)}</h4>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                    {breakdown.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">Συνολικό Ποσό</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(breakdown.totalAmount)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-600">Αριθμός Εξόδων</span>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {formatNumber(breakdown.count)}
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${breakdown.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CustomCard>
                )}

                {/* Modals */}
                {isCreateModalOpen && (
                    <ExpenseCreateModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSubmit={handleCreateExpense}
                        expenseTypes={expenseTypes}
                    />
                )}

                {isUpdateModalOpen && selectedExpense && (
                    <ExpenseUpdateModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onSubmit={handleUpdateExpense}
                        expense={selectedExpense}
                        expenseTypes={expenseTypes}
                    />
                )}

                {isDeleteModalOpen && selectedExpense && (
                    <ConfirmDeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteExpense}
                        title="Διαγραφή Εξόδου"
                        message={`Είστε σίγουροι ότι θέλετε να διαγράψετε το έξοδο "${selectedExpense.description}"?`}
                    />
                )}

                {isDetailsModalOpen && expenseDetails && (
                    <ExpenseDetailModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                        expense={expenseDetails}
                        loading={loading}
                        expenseTypes={expenseTypes}
                    />
                )}

                {isSuccessModalOpen && (
                    <SuccessModal
                        title={successMessage}
                        isOpen={isSuccessModalOpen}
                        onClose={() => setIsSuccessModalOpen(false)}
                        message={successMessage}
                    />
                )}
            </div>
        </div>
    );
};

export default ExpenseManagementPage;