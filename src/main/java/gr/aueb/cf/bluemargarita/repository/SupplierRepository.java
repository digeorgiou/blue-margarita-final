package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>,
        JpaSpecificationExecutor<Supplier> {
    boolean existsByTin(String tin);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    List<Supplier> findByIsActiveTrue();

    /**
     * Basic supplier purchase metrics - following CustomerRepository pattern
     */
    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Integer countPurchasesBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(p.totalCost), 0) FROM Purchase p WHERE p.supplier.id = :supplierId")
    BigDecimal sumTotalCostBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT MAX(p.purchaseDate) FROM Purchase p WHERE p.supplier.id = :supplierId")
    LocalDate findLastPurchaseDateBySupplierId(@Param("supplierId") Long supplierId);

    /**
     * Top materials by supplier - aggregated data, not full entities
     * Following the same pattern as CustomerRepository.findTopProductsByCustomerId
     */
    @Query(value = """
        SELECT m.id, m.name, m.name as description,
               SUM(pm.quantity) as totalQuantity,
               SUM(pm.quantity * pm.price_at_the_time) as totalCost,
               MAX(p.purchase_date) as lastPurchaseDate
        FROM purchase_material pm
        JOIN purchases p ON pm.purchase_id = p.id
        JOIN materials m ON pm.material_id = m.id
        WHERE p.supplier_id = :supplierId
        GROUP BY m.id, m.name
        ORDER BY SUM(pm.quantity * pm.price_at_the_time) DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> findTopMaterialsBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT DISTINCT pm.material.id FROM PurchaseMaterial pm " +
            "JOIN pm.purchase p WHERE p.supplier.id = :supplierId " +
            "ORDER BY pm.material.name")
    List<Long> findDistinctMaterialIdsBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(pm.quantity), 0) FROM PurchaseMaterial pm " +
            "JOIN pm.purchase p WHERE p.supplier.id = :supplierId AND pm.material.id = :materialId")
    BigDecimal sumQuantityBySupplierIdAndMaterialId(@Param("supplierId") Long supplierId,
                                                    @Param("materialId") Long materialId);

    @Query("SELECT COALESCE(SUM(pm.quantity * pm.priceAtTheTime), 0) FROM PurchaseMaterial pm " +
            "JOIN pm.purchase p WHERE p.supplier.id = :supplierId AND pm.material.id = :materialId")
    BigDecimal sumCostBySupplierIdAndMaterialId(@Param("supplierId") Long supplierId,
                                                @Param("materialId") Long materialId);

    @Query("SELECT MAX(p.purchaseDate) FROM PurchaseMaterial pm " +
            "JOIN pm.purchase p WHERE p.supplier.id = :supplierId AND pm.material.id = :materialId")
    LocalDate findLastPurchaseDateBySupplierIdAndMaterialId(@Param("supplierId") Long supplierId,
                                                            @Param("materialId") Long materialId);
}
