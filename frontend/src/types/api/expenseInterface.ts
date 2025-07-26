export interface ExpensesOverviewDTO {
    expenseTypes: ExpenseTypeDTO[];
    recentExpenses: ExpenseReadOnlyDTO[];
}

export interface ExpenseTypeDTO {
    value: string;
    displayName: string;
}

export interface ExpenseReadOnlyDTO {
    id: number;
    description: string;
    amount: number;
    expenseDate: string;
    expenseType: string;
    purchaseId?: number;
    purchaseDescription?: string;
    createdAt: string;
    createdBy: string;
}

export interface ExpenseInsertDTO {
    description: string;
    amount: number;
    expenseDate: string;
    expenseType: string;
    purchaseId?: number;
    creatorUserId?: number;
}

export interface ExpenseUpdateDTO {
    expenseId: number;
    description: string;
    amount: number;
    expenseDate: string;
    expenseType: string;
    purchaseId?: number;
    updaterUserId?: number;
}

export interface PaginatedFilteredExpensesWithSummary {
    data: ExpenseReadOnlyDTO[];
    totalElements: number;
    numberOfElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    summary: ExpenseSummaryDTO;
}

export interface ExpenseTypeBreakdownDTO{
    expenseType: string;
    expenseTypeDisplayName: string;
    totalAmount: number;
    count: number;
    percentage: number;
}

export interface ExpenseSummaryDTO{
    totalCount: number;
    totalAmount: number;
    averageAmount: number;
}