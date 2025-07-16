package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.model.Sale;
import org.springframework.data.domain.Page;
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
public interface SaleRepository extends JpaRepository<Sale, Long>,
        JpaSpecificationExecutor<Sale> {

    /**
     * we use database aggregation to avoid loading large datasets into memory
     */

// Basic counting - already exists, just ensuring it's here
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.location.id = :locationId")
    Integer countByLocationId(@Param("locationId") Long locationId);

    // Total revenue calculation
    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.location.id = :locationId")
    BigDecimal sumRevenueByLocationId(@Param("locationId") Long locationId);

    // Date range queries
    @Query("SELECT MIN(s.saleDate) FROM Sale s WHERE s.location.id = :locationId")
    LocalDate findFirstSaleDateByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.location.id = :locationId")
    LocalDate findLastSaleDateByLocationId(@Param("locationId") Long locationId);

    // Recent performance (last 30 days)
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

    @Query("SELECT COUNT(s) FROM Sale s")
    Integer countAllSales();

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s")
    BigDecimal sumAllRevenue();

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Top performing products
    @Query(value = """
    SELECT p.id, p.name, p.code,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue
    FROM sales s 
    JOIN sale_product sp ON s.id = sp.sale_id
    JOIN products p ON sp.product_id = p.id
    WHERE s.sale_date BETWEEN :startDate AND :endDate
    GROUP BY p.id, p.name, p.code 
    ORDER BY SUM(sp.quantity * sp.price_at_the_time) DESC
    LIMIT 10
    """, nativeQuery = true)
    List<Object[]> findTopSellingProductsByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Customer analytics
    @Query("SELECT COUNT(DISTINCT s.customer.id) FROM Sale s WHERE s.customer IS NOT NULL")
    Integer countUniqueCustomers();

    @Query("SELECT COUNT(DISTINCT s.customer.id) FROM Sale s WHERE s.customer IS NOT NULL AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countUniqueCustomersByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Average order value
    @Query("SELECT AVG(s.finalTotalPrice) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAverageOrderValueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Finds sales within a date range with pagination and sorting support
     * Used for "View All Today's Sales" functionality
     */
    @Query("SELECT s FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    Page<Sale> findSalesByDateRange(@Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate,
                                    Pageable pageable);


    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE " +
            "s.saleDate >= :startDate AND s.saleDate <= :endDate")
    BigDecimal sumRevenueBetweenDates(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(s) FROM Sale s WHERE " +
            "s.saleDate >= :startDate AND s.saleDate <= :endDate")
    Long countSalesBetweenDates(@Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);

}
