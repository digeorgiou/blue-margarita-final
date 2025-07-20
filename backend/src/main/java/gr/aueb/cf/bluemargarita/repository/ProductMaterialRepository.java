package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.ProductMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductMaterialRepository extends JpaRepository<ProductMaterial,Long>,
        JpaSpecificationExecutor<ProductMaterial> {

    // =============================================================================
    // MATERIAL QUERIES
    // =============================================================================

    Integer countByMaterialId(Long materialId);

    @Query("SELECT pm.product.id FROM ProductMaterial pm WHERE pm.material.id = :materialId AND pm.product.isActive = true")
    List<Long> findProductIdsByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT DISTINCT pm.product.category.id FROM ProductMaterial pm WHERE pm.material.id = :materialId AND pm.product.category IS NOT NULL AND pm.product.isActive = true")
    List<Long> findCategoryIdsByMaterialId(@Param("materialId") Long materialId);

    // =============================================================================
    // MATERIAL + CATEGORY QUERIES
    // =============================================================================

    @Query("SELECT COUNT(pm) FROM ProductMaterial pm WHERE pm.product.category.id = :categoryId AND pm.material.id = :materialId AND pm.product.isActive = true")
    Integer countProductsByCategoryIdAndMaterialId(@Param("categoryId") Long categoryId, @Param("materialId") Long materialId);

    // =============================================================================
    // MATERIAL + PRODUCT QUERIES
    // =============================================================================

    @Query("SELECT pm.quantity FROM ProductMaterial pm WHERE pm.product.id = :productId AND pm.material.id = :materialId")
    BigDecimal findQuantityByProductIdAndMaterialId(@Param("productId") Long productId, @Param("materialId") Long materialId);

    @Query("SELECT AVG(pm.quantity * pm.material.currentUnitCost) FROM ProductMaterial pm WHERE pm.material.id = :materialId")
    BigDecimal calculateAverageCostPerProductByMaterialId(@Param("materialId") Long materialId);
}
