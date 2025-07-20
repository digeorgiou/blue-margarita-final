package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.PurchaseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PurchaseMaterialRepository extends JpaRepository<PurchaseMaterial, Long>, JpaSpecificationExecutor<PurchaseMaterial> {

    // =============================================================================
    // MATERIAL QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT pm.purchase.id) FROM PurchaseMaterial pm WHERE pm.material.id = :materialId")
    Integer countPurchasesByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT MAX(pm.purchase.purchaseDate) FROM PurchaseMaterial pm WHERE pm.material.id = :materialId")
    LocalDate findLastPurchaseDateByMaterialId(@Param("materialId") Long materialId);

    // =============================================================================
    // MATERIAL + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT COALESCE(SUM(pm.quantity), 0) FROM PurchaseMaterial pm WHERE pm.material.id = :materialId AND pm.purchase.purchaseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByMaterialIdAndDateRange(@Param("materialId") Long materialId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(AVG(pm.priceAtTheTime), 0) FROM PurchaseMaterial pm WHERE pm.material.id = :materialId AND pm.purchase.purchaseDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAveragePriceByMaterialIdAndDateRange(@Param("materialId") Long materialId,
                                                             @Param("startDate") LocalDate startDate,
                                                             @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT pm.purchase.id) FROM PurchaseMaterial pm WHERE pm.material.id = :materialId")
    Integer countDistinctPurchasesByMaterialId(@Param("materialId") Long materialId);

    // =============================================================================
    // SUPPLIER + MATERIAL
    // =============================================================================

    @Query("SELECT DISTINCT pm.material.id FROM PurchaseMaterial pm WHERE pm.purchase.supplier.id = :supplierId")
    List<Long> findDistinctMaterialIdsBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(pm.quantity), 0) FROM PurchaseMaterial pm WHERE pm.purchase.supplier.id = :supplierId AND pm.material.id = :materialId")
    BigDecimal sumQuantityBySupplierIdAndMaterialId(@Param("supplierId") Long supplierId, @Param("materialId") Long materialId);

    @Query("SELECT COALESCE(SUM(pm.quantity * pm.priceAtTheTime), 0) FROM PurchaseMaterial pm WHERE pm.purchase.supplier.id = :supplierId AND pm.material.id = :materialId")
    BigDecimal sumCostBySupplierIdAndMaterialId(@Param("supplierId") Long supplierId, @Param("materialId") Long materialId);

    @Query("SELECT MAX(pm.purchase.purchaseDate) FROM PurchaseMaterial pm WHERE pm.purchase.supplier.id = :supplierId AND pm.material.id = :materialId")
    LocalDate findLastPurchaseDateBySupplierIdAndMaterialId(@Param("supplierId") Long supplierId, @Param("materialId") Long materialId);
}
