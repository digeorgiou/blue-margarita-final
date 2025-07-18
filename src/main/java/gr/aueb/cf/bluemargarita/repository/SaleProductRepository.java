package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.SaleProduct;
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
public interface SaleProductRepository extends JpaRepository<SaleProduct, Long>,
        JpaSpecificationExecutor<SaleProduct> {

    @Query("SELECT COUNT(sp), COALESCE(SUM(sp.quantity), 0), COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    Object[] calculateProductMetricsByDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Weekly sales aggregation
    @Query(value = """
    SELECT YEAR(s.sale_date) as year, WEEK(s.sale_date) as week,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    WHERE sp.product_id = :productId
      AND s.sale_date BETWEEN :startDate AND :endDate
    GROUP BY YEAR(s.sale_date), WEEK(s.sale_date)
    ORDER BY year DESC, week DESC
    """, nativeQuery = true)
    List<Object[]> calculateWeeklySalesByProductId(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Monthly sales aggregation
    @Query(value = """
    SELECT YEAR(s.sale_date) as year, MONTH(s.sale_date) as month,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    WHERE sp.product_id = :productId
      AND s.sale_date BETWEEN :startDate AND :endDate
    GROUP BY YEAR(s.sale_date), MONTH(s.sale_date)
    ORDER BY year DESC, month DESC
    """, nativeQuery = true)
    List<Object[]> calculateMonthlySalesByProductId(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Top customers for product
    @Query(value = """
    SELECT c.id, c.first_name, c.last_name,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue,
           MAX(s.sale_date) as lastSaleDate
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE sp.product_id = :productId
      AND s.sale_date BETWEEN :startDate AND :endDate
      AND c.id IS NOT NULL
    GROUP BY c.id, c.first_name, c.last_name
    ORDER BY SUM(sp.quantity * sp.price_at_the_time) DESC
    LIMIT 5
    """, nativeQuery = true)
    List<Object[]> findTopCustomersByProductId(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
    SELECT YEAR(s.sale_date) as year,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    WHERE sp.product_id = :productId
      AND s.sale_date BETWEEN :startDate AND :endDate
    GROUP BY YEAR(s.sale_date)
    ORDER BY year DESC
    """, nativeQuery = true)
    List<Object[]> calculateYearlySalesByProductId(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
    SELECT l.id, l.name,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue,
           COUNT(DISTINCT s.id) as numberOfSales
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    JOIN locations l ON s.location_id = l.id
    WHERE sp.product_id = :productId
      AND s.sale_date BETWEEN :startDate AND :endDate
    GROUP BY l.id, l.name
    ORDER BY SUM(sp.quantity * sp.price_at_the_time) DESC
    LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopLocationsByProductId(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("limit") int limit
    );

    /**
     * Finds all products by revenue for a date range with pagination and sorting
     * Used for "View All Products for Month" functionality
     */
    @Query(value = """
    SELECT p.id, p.name, p.code,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue,
           MAX(s.sale_date) as lastSaleDate
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    JOIN products p ON sp.product_id = p.id
    WHERE s.sale_date BETWEEN :startDate AND :endDate
      AND p.is_active = true
    GROUP BY p.id, p.name, p.code
    """,
            countQuery = """
    SELECT COUNT(DISTINCT p.id)
    FROM sale_product sp
    JOIN sales s ON sp.sale_id = s.id
    JOIN products p ON sp.product_id = p.id
    WHERE s.sale_date BETWEEN :startDate AND :endDate
      AND p.is_active = true
    """,
            nativeQuery = true)
    Page<Object[]> findAllProductsByRevenuePaginated(@Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate,
                                                     Pageable pageable);

    // Basic sales queries
    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp WHERE sp.product.id = :productId")
    BigDecimal sumQuantityByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.id = :productId")
    BigDecimal sumRevenueByProductId(@Param("productId") Long productId);

    @Query("SELECT MAX(s.saleDate) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId")
    LocalDate findLastSaleDateByProductId(@Param("productId") Long productId);

    // Location-specific sales queries
    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.location.id = :locationId")
    List<Long> findDistinctProductIdsByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.customer.id = :customerId")
    List<Long> findDistinctProductIdsByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId")
    BigDecimal sumQuantityByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId")
    BigDecimal sumRevenueByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    @Query("SELECT MAX(s.saleDate) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId")
    LocalDate findLastSaleDateByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    // Customer-specific product sales queries
    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId")
    BigDecimal sumQuantityByProductIdAndCustomerId(@Param("productId") Long productId, @Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId")
    BigDecimal sumRevenueByProductIdAndCustomerId(@Param("productId") Long productId, @Param("customerId") Long customerId);

    @Query("SELECT MAX(s.saleDate) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId")
    LocalDate findLastSaleDateByProductIdAndCustomerId(@Param("productId") Long productId, @Param("customerId") Long customerId);

}
