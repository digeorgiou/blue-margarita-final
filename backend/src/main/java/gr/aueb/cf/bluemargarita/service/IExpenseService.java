package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.ExpenseFilters;
import gr.aueb.cf.bluemargarita.dto.expense.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IExpenseService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new expense record

     * @param dto Expense creation data
     * @return Detailed view of the created expense
     * @throws EntityNotFoundException if user or purchase not found
     */
    ExpenseReadOnlyDTO createExpense(ExpenseInsertDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException;

    /**
     * Updates an existing expense

     * @param dto Expense update data
     * @return Updated expense as read-only DTO
     * @throws EntityNotFoundException if expense, user, or purchase not found
     */
    ExpenseReadOnlyDTO updateExpense(ExpenseUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException;

    /**
     * Deletes an expense
     * Hard delete - expenses can be removed completely
     * If expense is linked to a purchase, also unlinks from purchase
     *
     * @param expenseId Expense ID to delete
     * @throws EntityNotFoundException if expense not found
     */
    void deleteExpense(Long expenseId) throws EntityNotFoundException;

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    /**
     * Retrieves the most recent expenses for dashboard widget
     * Ordered by expense date descending, then by creation time descending
     *
     * @param limit Maximum number of recent expenses to return (typically 5)
     * @return List of recent expenses with basic information
     */
    List<ExpenseReadOnlyDTO> getRecentExpenses(int limit);

    // =============================================================================
    // VIEW EXPENSES PAGE METHODS
    // =============================================================================

    /**
     * Searches expenses with advanced filtering and optional summary calculation
     *
     * Supports filtering by:
     * - Description (partial text search)
     * - Date range (expenseDateFrom, expenseDateTo)
     * - Amount range (minAmount, maxAmount)
     * - Expense type (enum value)
     * - Purchase-linked status (isPurchase boolean)
     *
     * Summary is only calculated if filtered results ≤ 100 for performance
     *
     * @param filters Filter criteria with pagination parameters
     * @return Paginated expense results with optional summary
     */
    PaginatedFilteredExpensesWithSummary searchExpensesWithSummary(ExpenseFilters filters);

    /**
     * Returns all available expense types
     * @return a list of dtos containing ExpenseType and display name for each type of expense
     */
    List<ExpenseTypeDTO> getAllAvailableExpenseTypes();


    // =============================================================================
    // EXPENSE ANALYTICS METHODS
    // =============================================================================

    /**
     * Gets expense breakdown by type for analytics
     * Useful for dashboard charts and expense analysis
     *
     * @param dateFrom Optional start date filter
     * @param dateTo Optional end date filter
     * @return List of expense type breakdowns with totals and percentages
     */
    List<ExpenseTypeBreakdownDTO> getExpenseBreakdownByType(LocalDate dateFrom, LocalDate dateTo);

    // =============================================================================
    // PURCHASE INTEGRATION METHODS
    // =============================================================================

    /**
     * Creates an expense automatically when a purchase is recorded
     * This method is called by PurchaseService when recording purchases
     *
     * @param purchaseId  Purchase ID to link
     * @param description Expense description
     * @param amount      Expense amount (usually same as purchase total cost)
     * @param expenseDate Expense date (usually same as purchase date)
     * @throws EntityNotFoundException if purchase or user not found
     */
    void createPurchaseExpense(Long purchaseId, String description,
                               BigDecimal amount, LocalDate expenseDate) throws EntityNotFoundException, EntityAlreadyExistsException;

    /**
     * Updates an expense when its linked purchase is updated
     * This method is called by PurchaseService when updating purchases
     *
     * @param purchaseId Purchase ID
     * @param newAmount New expense amount
     * @param newDate New expense date
     * @throws EntityNotFoundException if purchase or user not found
     */
    void updatePurchaseExpense(Long purchaseId, java.math.BigDecimal newAmount,
                               java.time.LocalDate newDate) throws EntityNotFoundException, EntityAlreadyExistsException;
}
