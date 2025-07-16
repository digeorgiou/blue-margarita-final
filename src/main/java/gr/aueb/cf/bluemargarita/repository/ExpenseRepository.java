package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.core.filters.ExpenseFilters;
import gr.aueb.cf.bluemargarita.model.Expense;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>,
        JpaSpecificationExecutor<Expense> {
    Boolean existsByPurchaseId(Long id);

    List<Expense> findRecentExpenses(Pageable pageable);

    Expense findByPurchaseId(Long id);

    @Query("SELECT COUNT(e) FROM Expense e WHERE (:filters conditions)")
    Integer countExpensesByFilters(@Param("filters") ExpenseFilters filters);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE (:filters conditions)")
    BigDecimal sumCostByFilters(@Param("filters") ExpenseFilters filters);

    @Query("SELECT e.expenseType, SUM(e.amount), COUNT(e) FROM Expense e " +
            "WHERE (:dateFrom IS NULL OR e.expenseDate >= :dateFrom) AND " +
            "(:dateTo IS NULL OR e.expenseDate <= :dateTo) " +
            "GROUP BY e.expenseType ORDER BY SUM(e.amount) DESC")
    List<Object[]> findExpenseSummaryByType(
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo
    );
}
