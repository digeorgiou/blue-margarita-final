package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);
    boolean existsByCode(String code);
    List<Product> findByIsActiveTrue();
    Integer countByIsActiveTrue();

    // =============================================================================
    // BASIC PRODUCT QUERIES
    // =============================================================================

    @Query("SELECT p.name FROM Product p WHERE p.id = :productId")
    String findProductNameById(@Param("productId") Long productId);

    @Query("SELECT p.code FROM Product p WHERE p.id = :productId")
    String findProductCodeById(@Param("productId") Long productId);

    @Query("SELECT CASE WHEN p.category IS NOT NULL THEN p.category.name ELSE 'No Category' END FROM Product p WHERE p.id = :productId")
    String findCategoryNameByProductId(@Param("productId") Long productId);

    // =============================================================================
    // CATEGORY QUERIES
    // =============================================================================

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    Integer countActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT p.id FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true ORDER BY p.finalSellingPriceRetail DESC")
    List<Long> findProductIdsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT AVG(p.suggestedRetailSellingPrice) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    BigDecimal calculateAverageRetailPriceByCategoryId(@Param("categoryId") Long categoryId);

    // =============================================================================
    // STOCK MANAGEMENT
    // =============================================================================

    @Query("SELECT COALESCE(SUM(p.stock * p.finalSellingPriceRetail), 0) FROM Product p WHERE p.isActive = true AND p.stock IS NOT NULL AND p.stock > 0")
    BigDecimal calculateTotalInventoryValue();


    // =============================================================================
    // WRONG PRICING ALERT
    // =============================================================================

    @Query("""
    SELECT p FROM Product p
    WHERE p.isActive = true
        AND (
          ((p.suggestedRetailSellingPrice - p.finalSellingPriceRetail) / p.finalSellingPriceRetail) * 100 >= :threshold
          OR
          ((p.suggestedWholeSaleSellingPrice - p.finalSellingPriceWholesale) / p.finalSellingPriceRetail) * 100 >= :threshold
      )
    """)
    List<Product> findProductsWithAnyPricingIssues(@Param("threshold") BigDecimal threshold, Pageable pageable);


    @Query("""
    SELECT COUNT(p) FROM Product p
    WHERE p.isActive = true
      AND (
          ((p.suggestedRetailSellingPrice - p.finalSellingPriceRetail) / p.finalSellingPriceRetail) * 100 >= :threshold
          OR
          ((p.suggestedWholeSaleSellingPrice - p.finalSellingPriceWholesale) / p.finalSellingPriceRetail) * 100 >= :threshold
      )
    """)
    long countProductsWithPricingIssues(@Param("threshold") BigDecimal threshold);
}
