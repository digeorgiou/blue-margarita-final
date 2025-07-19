package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("SELECT p.name FROM Product p WHERE p.id = :productId")
    String findProductNameById(@Param("productId") Long productId);

    @Query("SELECT p.code FROM Product p WHERE p.id = :productId")
    String findProductCodeById(@Param("productId") Long productId);

    @Query("SELECT CASE WHEN p.category IS NOT NULL THEN p.category.name ELSE 'No Category' END FROM Product p WHERE p.id = :productId")
    String findCategoryNameByProductId(@Param("productId") Long productId);

    @Query("SELECT pm.quantity FROM ProductMaterial pm WHERE pm.product.id = :productId AND pm.material.id = :materialId")
    BigDecimal findMaterialQuantityForProduct(@Param("productId") Long productId, @Param("materialId") Long materialId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s JOIN s.saleProducts sp WHERE sp.product.id = :productId")
    LocalDate findLastSaleDateByProductId(@Param("productId") Long productId);

    @Query("SELECT p.id FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true ORDER BY p.finalSellingPriceRetail DESC")
    List<Long> findProductIdsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT pm.product.id FROM ProductMaterial pm WHERE pm.material.id = :materialId AND pm.product.isActive = true")
    List<Long> findProductIdsByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT DISTINCT p.category.id FROM Product p JOIN p.productMaterials pm WHERE pm.material.id = :materialId AND p.category IS NOT NULL AND p.isActive = true")
    List<Long> findCategoryIdsByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT DISTINCT p.category.id FROM Product p JOIN p.procedureProducts pp WHERE pp.procedure.id = :procedureId AND p.category IS NOT NULL AND p.isActive = true")
    List<Long> findCategoryIdsByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT pp.product.id FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId AND pp.product.isActive = true")
    List<Long> findProductIdsByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT pp.cost FROM ProductProcedure pp WHERE pp.product.id = :productId AND pp.procedure.id = :procedureId")
    BigDecimal findProcedureCostForProduct(@Param("productId") Long productId, @Param("procedureId") Long procedureId);

    @Query("SELECT COUNT(p) FROM Product p JOIN p.productMaterials pm WHERE pm.material.id = :materialId AND p.isActive = true")
    Integer countProductsByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.id IN (SELECT pm.product.id FROM ProductMaterial pm WHERE pm.material.id = :materialId) AND p.isActive = true")
    Integer countProductsByCategoryIdAndMaterialId(@Param("categoryId") Long categoryId, @Param("materialId") Long materialId);

    /**
     * Finds products with negative stock with pagination and sorting support
     * Used for "View All Negative Stock" functionality
     */
    @Query("SELECT p FROM Product p WHERE p.stock < 0 AND p.isActive = true")
    Page<Product> findProductsWithNegativeStock(Pageable pageable);


    // Gets current stock level for a product
    @Query("SELECT p.stock FROM Product p WHERE p.id = :productId")
    Integer getCurrentStockById(@Param("productId") Long productId);

    //Updates stock level for a product
    @Modifying
    @Query("UPDATE Product p SET p.stock = :newStock WHERE p.id = :productId")
    void updateStockById(@Param("productId") Long productId, @Param("newStock") Integer newStock);

    @Query("SELECT COALESCE(SUM(p.stock * p.finalSellingPriceRetail), 0) FROM Product p WHERE p.isActive = true AND p.stock IS NOT NULL AND p.stock > 0")
    BigDecimal calculateTotalInventoryValue();

}
