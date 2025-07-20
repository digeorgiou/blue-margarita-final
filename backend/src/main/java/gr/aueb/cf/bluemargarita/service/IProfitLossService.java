package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.filters.ProfitLossFilters;
import gr.aueb.cf.bluemargarita.dto.analytics.ProfitLossReportDTO;

public interface IProfitLossService {

    /**
     * Generates a simple profit/loss report for the specified time period
     *
     * Calculates:
     * - Total Revenue (sum of all sales)
     * - Total Expenses (sum of all expenses)
     * - Net Profit (revenue - expenses)
     * - Profit Margin percentage
     * - Expense breakdown by type
     *
     * @param filters Date range filters
     * @return Profit/loss report for the period
     */
    ProfitLossReportDTO generateProfitLossReport(ProfitLossFilters filters);
}
