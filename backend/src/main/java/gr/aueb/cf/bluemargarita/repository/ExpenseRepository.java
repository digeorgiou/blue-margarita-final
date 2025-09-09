package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
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

    // Gets expenses by actual date first, then by creation time
    List<Expense> findAllByOrderByExpenseDateDescCreatedAtDesc(Pageable pageable);

    Expense findByPurchaseId(Long id);

    /**
     * Simple method to sum all expenses between dates
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE " +
            "e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    BigDecimal sumExpensesBetweenDates(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);


    /**
     * Simple method to count all expenses between dates
     */
    @Query("SELECT COUNT(e) FROM Expense e WHERE " +
            "e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    Long countExpensesBetweenDates(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);


    @Query("SELECT DISTINCT e.expenseType FROM Expense e WHERE " +
            "e.expenseDate >= :dateFrom AND e.expenseDate <= :dateTo " +
            "ORDER BY e.expenseType")
    List<ExpenseType> findDistinctExpenseTypesByDateRange(@Param("dateFrom") LocalDate dateFrom,
                                                          @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COALESCE(SUM(e.amount), 0.0) FROM Expense e WHERE " +
            "e.expenseType = :expenseType AND " +
            "e.expenseDate >= :dateFrom AND e.expenseDate <= :dateTo")
    BigDecimal sumAmountByTypeAndDateRange(@Param("expenseType") ExpenseType expenseType,
                                           @Param("dateFrom") LocalDate dateFrom,
                                           @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COUNT(e) FROM Expense e WHERE " +
            "e.expenseType = :expenseType AND " +
            "e.expenseDate >= :dateFrom AND e.expenseDate <= :dateTo")
    Long countByTypeAndDateRange(@Param("expenseType") ExpenseType expenseType,
                                 @Param("dateFrom") LocalDate dateFrom,
                                 @Param("dateTo") LocalDate dateTo);


}
