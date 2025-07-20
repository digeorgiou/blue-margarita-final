package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long>,
        JpaSpecificationExecutor<Purchase> {


    // =============================================================================
    // SUPPLIER QUERIES
    // =============================================================================

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.supplier.id = :supplierId")
    Integer countBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(p.totalCost), 0) FROM Purchase p WHERE p.supplier.id = :supplierId")
    BigDecimal sumCostBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT MAX(p.purchaseDate) FROM Purchase p WHERE p.supplier.id = :supplierId")
    LocalDate findLastPurchaseDateBySupplierId(@Param("supplierId") Long supplierId);

}

