package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Product;
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
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);
    boolean existsByCode(String code);
    List<Product> findByIsActiveTrue();
    Integer countByIsActiveTrue();

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.id = :productId")
    Integer countSalesByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp WHERE sp.product.id = :productId")
    Integer sumQuantitySoldByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.id = :productId")
    BigDecimal sumRevenueByProductId(@Param("productId") Long productId);

    @Query("SELECT MIN(s.saleDate) FROM Sale s JOIN s.saleProducts sp WHERE sp.product.id = :productId")
    LocalDate findFirstSaleDateByProductId(@Param("productId") Long productId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s JOIN s.saleProducts sp WHERE sp.product.id = :productId")
    LocalDate findLastSaleDateByProductId(@Param("productId") Long productId);

    // Date range analytics
    @Query("SELECT COUNT(sp) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer sumQuantitySoldByProductIdAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Stock and inventory insights
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock <= p.lowStockAlert AND p.isActive = true")
    Integer countLowStockProducts();

    @Query("SELECT COALESCE(SUM(p.stock * p.finalSellingPriceRetail), 0) FROM Product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryValue();

    // Category distribution
    @Query(value = """
    SELECT c.id, c.name, COUNT(*) as productCount,
           AVG(p.final_selling_price_retail) as avgPrice
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
    GROUP BY c.id, c.name
    ORDER BY COUNT(*) DESC
    """, nativeQuery = true)
    List<Object[]> calculateCategoryDistribution();

    /**
     * Finds products with negative stock with pagination and sorting support
     * Used for "View All Negative Stock" functionality
     */
    @Query("SELECT p FROM Product p WHERE p.stock < 0 AND p.isActive = true")
    Page<Product> findProductsWithNegativeStock(Pageable pageable);

    /**
     * Counts products with negative stock (for dashboard widget)
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock < 0 AND p.isActive = true")
    Integer countProductsWithNegativeStock();

    /**
     * Gets top negative stock products for dashboard widget (limit for performance)
     */
    @Query("SELECT p FROM Product p WHERE p.stock < 0 AND p.isActive = true ORDER BY p.stock ASC")
    List<Product> findTopNegativeStockProducts(Pageable pageable);

}
