import { ExpenseTypeBreakdownDTO } from "./expenseInterface.ts";

export interface ProfitLossReportDTO {
    periodStart: string; // ISO date string
    periodEnd: string;   // ISO date string
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number; // Percentage
    totalSales: number;
    totalExpenseEntries: number;
    expensesByType: ExpenseTypeBreakdownDTO[];
}

export interface ProfitLossPageInitData {
    currentMonthReport: ProfitLossReportDTO;
    lastMonthReport: ProfitLossReportDTO;
    currentYearReport: ProfitLossReportDTO;
    lastYearReport: ProfitLossReportDTO;
}