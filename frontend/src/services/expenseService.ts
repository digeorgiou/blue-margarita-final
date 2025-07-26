import { authService } from './authService';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import {
    ExpenseReadOnlyDTO,
    ExpenseInsertDTO,
    ExpenseUpdateDTO,
    ExpenseTypeDTO,
    PaginatedFilteredExpensesWithSummary,
    ExpenseTypeBreakdownDTO,
} from '../types/api/expenseInterface';

const API_BASE_URL = '/api/expense-management';

class ExpenseService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // PAGE INITIALIZATION - LOAD FORM DATA
    // =============================================================================

    /**
     * Get all necessary data for the Expense Management page in a single request
     * Returns expense types dropdown and recent expenses overview
     */
    async getExpenseTypes(): Promise<ExpenseTypeDTO[]> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/init`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get expense management page data error:', error);
            throw error;
        }
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Create a new expense record
     * Can optionally be linked to a purchase for automatic expense tracking
     */
    async createExpense(expenseData: ExpenseInsertDTO): Promise<ExpenseReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expenseData)
            });

            return await response.json();
        } catch (error) {
            console.error('Create expense error:', error);
            throw error; // ApiError will be handled by the modal
        }
    }

    /**
     * Update an existing expense record
     * Including description, amount, date, type, and purchase linking
     */
    async updateExpense(expenseId: number, expenseData: ExpenseUpdateDTO): Promise<ExpenseReadOnlyDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${expenseId}`, {
                method: 'PUT',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expenseData)
            });

            return await response.json();
        } catch (error) {
            console.error('Update expense error:', error);
            throw error;
        }
    }

    /**
     * Delete an expense record completely
     * If linked to a purchase, it will be unlinked first
     * Requires ADMIN role
     */
    async deleteExpense(expenseId: number): Promise<void> {
        try {
            await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/${expenseId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Delete expense error:', error);
            throw error;
        }
    }

    // =============================================================================
    // EXPENSE LISTING AND FILTERING
    // =============================================================================

    /**
     * Search expenses with advanced filtering and summary
     * Includes pagination and filtering support with optional summary calculation
     * Main endpoint for expense management page listing
     */
    async searchExpensesWithSummary(filters: {
        description?: string;
        expenseDateFrom?: string; // ISO date string
        expenseDateTo?: string;   // ISO date string
        expenseType?: string;
        isPurchase?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    }): Promise<PaginatedFilteredExpensesWithSummary> {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Search expenses with summary error:', error);
            throw error;
        }
    }

    // =============================================================================
    // EXPENSE ANALYTICS
    // =============================================================================

    /**
     * Get expense breakdown by type for analytics and reporting
     * Shows total amount, count, and percentage for each expense type in date range
     */
    async getExpenseBreakdownByType(filters: {
        dateFrom?: string; // ISO date string
        dateTo?: string;   // ISO date string
    } = {}): Promise<ExpenseTypeBreakdownDTO[]> {
        try {
            const queryParams = new URLSearchParams();

            // Add filter parameters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/analytics/breakdown-by-type?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get expense breakdown by type error:', error);
            throw error;
        }
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    /**
     * Format expense date for API calls
     * Converts Date object to ISO date string expected by backend
     */
    formatDateForApi(date: Date | string): string {
        if (typeof date === 'string') return date;
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    /**
     * Parse date string from API response
     * Converts ISO date string to Date object
     */
    parseDateFromApi(dateString: string): Date {
        return new Date(dateString);
    }

    /**
     * Format currency amount for display
     * Uses Greek locale formatting
     */
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format number for display
     * Uses Greek locale formatting
     */
    formatNumber(num: number): string {
        return new Intl.NumberFormat('el-GR').format(num);
    }
}

// Export a singleton instance
export const expenseService = new ExpenseService();