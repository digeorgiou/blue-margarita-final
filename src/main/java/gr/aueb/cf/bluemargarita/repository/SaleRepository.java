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

    // Average order value
    @Query("SELECT AVG(s.finalTotalPrice) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAverageOrderValueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT s FROM Sale s WHERE s.saleDate = :saleDate")
    Page<Sale> findBySaleDate(@Param("saleDate") LocalDate saleDate, Pageable pageable);



    /**
     * Counts sales matching filter criteria
     * Uses Specification but with simple count aggregation
     */
    @Query("SELECT COUNT(s) FROM Sale s WHERE (:filters)")
    Integer countSalesByFilters(@Param("filters") SaleFilters filters);

    /**
     * Sums revenue for filtered sales
     * Simple aggregation with filters
     */
    @Query("SELECT SUM(s.finalTotalPrice) FROM Sale s WHERE (:filters)")
    BigDecimal sumRevenueByFilters(@Param("filters") SaleFilters filters);

    /**
     * Sums discount amounts for filtered sales
     * Simple aggregation following your pattern
     */
    @Query("SELECT SUM(s.suggestedTotalPrice - s.finalTotalPrice) FROM Sale s WHERE (:filters)")
    BigDecimal sumDiscountAmountByFilters(@Param("filters") SaleFilters filters);

    /**
     * Calculates average discount percentage for filtered sales
     * Simple aggregation following your pattern
     */
    @Query("SELECT AVG(s.discountPercentage) FROM Sale s WHERE (:filters)")
    BigDecimal avgDiscountPercentageByFilters(@Param("filters") SaleFilters filters);


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

    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.location.id = :locationId")
    List<Long> findDistinctProductIdsByLocationId(@Param("locationId") Long locationId);

    //Customer

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId")
    Integer countByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.customer.id = :customerId")
    BigDecimal sumRevenueByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.customer.id = :customerId")
    LocalDate findLastSaleDateByCustomerId(@Param("customerId") Long customerId);

    // Date range queries
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);



}
