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

    Integer countByMaterialId(Long materialId);
    Integer countByProductId(Long productId);

    // Sum quantities directly
    @Query("SELECT COALESCE(SUM(pm.quantity), 0) FROM ProductMaterial pm WHERE pm.material.id = :materialId")
    BigDecimal sumQuantityByMaterialId(@Param("materialId") Long materialId);

    // Find relationships directly
    List<ProductMaterial> findByMaterialId(Long materialId);
    List<ProductMaterial> findByProductId(Long productId);

    // Costs and quantities
    @Query("SELECT pm.quantity FROM ProductMaterial pm WHERE pm.product.id = :productId AND pm.material.id = :materialId")
    BigDecimal findQuantityByProductIdAndMaterialId(@Param("productId") Long productId, @Param("materialId") Long materialId);
}
