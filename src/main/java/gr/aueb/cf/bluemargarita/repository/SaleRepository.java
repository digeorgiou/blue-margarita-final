package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>,
        JpaSpecificationExecutor<Sale> {

    // =============================================================================
    // LOCATION QUERIES
    // =============================================================================

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.location.id = :locationId")
    Integer countByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.location.id = :locationId")
    BigDecimal sumRevenueByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.location.id = :locationId")
    LocalDate findLastSaleDateByLocationId(@Param("locationId") Long locationId);

    // =============================================================================
    // LOCATION + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countByLocationIdAndDateRange(
            @Param("locationId") Long locationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByLocationIdAndDateRange(
            @Param("locationId") Long locationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // =============================================================================
    // CUSTOMER QUERIES
    // =============================================================================

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId")
    Integer countByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.customer.id = :customerId")
    BigDecimal sumRevenueByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.customer.id = :customerId")
    LocalDate findLastSaleDateByCustomerId(@Param("customerId") Long customerId);

    // =============================================================================
    // CUSTOMER + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    // =============================================================================
    // PROFIT-LOSS QUERIES
    // =============================================================================

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(s.finalTotalPrice) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAverageOrderValueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
}
