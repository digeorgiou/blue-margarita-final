package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.filters.ProfitLossFilters;
import gr.aueb.cf.bluemargarita.dto.analytics.ProfitLossReportDTO;
import gr.aueb.cf.bluemargarita.dto.expense.ExpenseTypeBreakdownDTO;
import gr.aueb.cf.bluemargarita.repository.ExpenseRepository;
import gr.aueb.cf.bluemargarita.repository.SaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@SuppressWarnings("unused")
@Service
public class ProfitLossService implements IProfitLossService{

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfitLossService.class);

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final IExpenseService expenseService;

    @Autowired
    public ProfitLossService(SaleRepository saleRepository, ExpenseRepository expenseRepository, IExpenseService expenseService) {
        this.saleRepository = saleRepository;
        this.expenseRepository = expenseRepository;
        this.expenseService = expenseService;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfitLossReportDTO generateProfitLossReport(ProfitLossFilters filters) {

        LOGGER.info("Generating profit/loss report for period: {} to {}",
                filters.getDateFrom(), filters.getDateTo());

        LocalDate startDate = filters.getDateFrom();
        LocalDate endDate = filters.getDateTo();

        // Calculate total revenue from sales
        BigDecimal totalRevenue = calculateTotalRevenue(startDate, endDate);
        Integer totalSales = countSales(startDate, endDate);

        // Calculate total expenses
        BigDecimal totalExpenses = calculateTotalExpenses(startDate, endDate);
        Integer totalExpenseEntries = countExpenses(startDate, endDate);

        // Calculate profit and margin
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        BigDecimal profitMargin = BigDecimal.ZERO;

        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Get expense breakdown by type
        List<ExpenseTypeBreakdownDTO> expenseBreakdown = expenseService.getExpenseBreakdownByType(startDate, endDate);

        LOGGER.info("Report generated - Revenue: €{}, Expenses: €{}, Profit: €{}",
                totalRevenue, totalExpenses, netProfit);

        return new ProfitLossReportDTO(
                startDate,
                endDate,
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin,
                totalSales,
                totalExpenseEntries,
                expenseBreakdown
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private BigDecimal calculateTotalRevenue(LocalDate startDate, LocalDate endDate) {
        return saleRepository.sumRevenueBetweenDates(startDate, endDate);
    }

    private Integer countSales(LocalDate startDate, LocalDate endDate) {
        return saleRepository.countSalesBetweenDates(startDate, endDate).intValue();
    }

    private BigDecimal calculateTotalExpenses(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.sumExpensesBetweenDates(startDate, endDate);
    }

    private Integer countExpenses(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.countExpensesBetweenDates(startDate, endDate).intValue();
    }

}



