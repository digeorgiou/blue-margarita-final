package gr.aueb.cf.bluemargarita.dto.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProfitLossReportDTO(
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal totalRevenue,
        BigDecimal totalExpenses,
        BigDecimal netProfit,
        BigDecimal profitMargin, // Percentage: (netProfit / totalRevenue) * 100
        Integer totalSales,
        Integer totalExpenseEntries,
        List<ExpenseBreakdownDTO> expensesByType
) {}
