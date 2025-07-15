package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Material;
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
public interface MaterialRepository extends JpaRepository<Material, Long>,
        JpaSpecificationExecutor<Material> {
    boolean existsByDescription(String description);
    List<Material> findByIsActiveTrue();
    List<Material> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    @Query("SELECT COUNT(pm) FROM ProductMaterial pm WHERE pm.material.id = :materialId")
    Integer countProductsUsingMaterial(@Param("materialId") Long materialId);

    @Query("SELECT AVG(pm.quantity), MIN(pm.quantity), MAX(pm.quantity) " +
            "FROM ProductMaterial pm WHERE pm.material.id = :materialId")
    Object[] calculateUsageStatsByMaterialId(@Param("materialId") Long materialId);


    @Query("SELECT AVG(pm.quantity * m.costPerUnit) " +
            "FROM ProductMaterial pm JOIN pm.material m WHERE m.id = :materialId")
    BigDecimal calculateAverageCostPerProductByMaterialId(@Param("materialId") Long materialId);


    /**
     * Purchase analytics - count purchases containing this material
     */
    @Query("SELECT COUNT(DISTINCT pm.purchase.id) FROM PurchaseMaterial pm WHERE pm.material.id = :materialId")
    Integer countPurchasesContainingMaterial(@Param("materialId") Long materialId);

    /**
     * Last purchase date for this material
     */
    @Query("SELECT MAX(p.purchaseDate) FROM Purchase p " +
            "JOIN p.purchaseMaterials pm WHERE pm.material.id = :materialId")
    LocalDate findLastPurchaseDateByMaterialId(@Param("materialId") Long materialId);


    /**
     * Top products using this material (for usage distribution in detailed view)
     * Orders by product price descending
     */
    @Query("SELECT p.id, p.name, p.code, pm.quantity, (pm.quantity * m.costPerUnit), " +
            "CASE WHEN p.category IS NOT NULL THEN p.category.name ELSE 'No Category' END " +
            "FROM Product p JOIN p.productMaterials pm JOIN pm.material m " +
            "WHERE m.id = :materialId " +
            "ORDER BY p.finalSellingPriceRetail DESC")  // ← Sort by product price
    List<Object[]> findTopProductsByMaterialUsage(@Param("materialId") Long materialId, Pageable pageable);

    /**
     * Get paginated products using a specific material (for "View All" functionality)
     */
    @Query("SELECT p.id, p.name, p.code, pm.quantity, (pm.quantity * m.costPerUnit), " +
            "CASE WHEN p.category IS NOT NULL THEN p.category.name ELSE 'No Category' END, " +
            "p.isActive, p.finalSellingPriceRetail " +
            "FROM Product p JOIN p.productMaterials pm JOIN pm.material m " +
            "WHERE m.id = :materialId")
    Page<Object[]> findAllProductsByMaterialUsagePaginated(@Param("materialId") Long materialId, Pageable pageable);
}
