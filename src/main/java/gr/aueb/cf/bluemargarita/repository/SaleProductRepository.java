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

    // Direct queries on SaleProduct table with simple joins
    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    Integer countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    BigDecimal sumRevenueByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT MAX(sp.sale.saleDate) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    LocalDate findLastSaleDateByCategoryId(@Param("categoryId") Long categoryId);

    // Date range queries
    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    Integer countByCategoryIdAndDateRange(@Param("categoryId") Long categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByCategoryIdAndDateRange(@Param("categoryId") Long categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


    // =============================================================================
    // MATERIAL QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId")
    Integer countSalesByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId")
    BigDecimal sumRevenueByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT MAX(sp.sale.saleDate) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId")
    LocalDate findLastSaleDateByMaterialId(@Param("materialId") Long materialId);

    // Date range queries
    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByMaterialIdAndDateRange(@Param("materialId") Long materialId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByMaterialIdAndDateRange(@Param("materialId") Long materialId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // =============================================================================
    // PROCEDURE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId")
    Integer countSalesByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId")
    BigDecimal sumRevenueByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT MAX(sp.sale.saleDate) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId")
    LocalDate findLastSaleDateByProcedureId(@Param("procedureId") Long procedureId);

    // Date range queries
    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProcedureIdAndDateRange(@Param("procedureId") Long procedureId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProcedureIdAndDateRange(@Param("procedureId") Long procedureId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdAndDateRange(@Param("productId") Long productId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByProductIdAndDateRange(@Param("productId") Long productId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdAndDateRange(@Param("productId") Long productId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(AVG(sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAverageSellingPriceByProductIdAndDateRange(@Param("productId") Long productId,
                                                                   @Param("startDate") LocalDate startDate,
                                                                   @Param("endDate") LocalDate endDate);

    // Location-specific queries
    @Query("SELECT DISTINCT s.location.id FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    List<Long> findDistinctLocationIdsByProductIdAndDateRange(@Param("productId") Long productId,
                                                              @Param("startDate") LocalDate startDate,
                                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByProductIdLocationIdAndDateRange(@Param("productId") Long productId,
                                                            @Param("locationId") Long locationId,
                                                            @Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdLocationIdAndDateRange(@Param("productId") Long productId,
                                                           @Param("locationId") Long locationId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdLocationIdAndDateRange(@Param("productId") Long productId,
                                                        @Param("locationId") Long locationId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    // Customer-specific queries
    @Query("SELECT DISTINCT s.customer.id FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer IS NOT NULL AND s.saleDate BETWEEN :startDate AND :endDate")
    List<Long> findDistinctCustomerIdsByProductIdAndDateRange(@Param("productId") Long productId,
                                                              @Param("startDate") LocalDate startDate,
                                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByProductIdCustomerIdAndDateRange(@Param("productId") Long productId,
                                                            @Param("customerId") Long customerId,
                                                            @Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdCustomerIdAndDateRange(@Param("productId") Long productId,
                                                           @Param("customerId") Long customerId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdCustomerIdAndDateRange(@Param("productId") Long productId,
                                                        @Param("customerId") Long customerId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.saleDate BETWEEN :startDate AND :endDate AND sp.product.isActive = true")
    List<Long> findDistinctProductIdsByDateRange(@Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.id = :productId")
    Integer countByProductId(@Param("productId") Long productId);


}
