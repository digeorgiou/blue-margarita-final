package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Procedure;
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
public interface ProcedureRepository extends JpaRepository<Procedure, Long>,
        JpaSpecificationExecutor<Procedure> {
    boolean existsByName(String name);
    List<Procedure> findByIsActiveTrue();

    // Basic procedure usage metrics
    @Query("SELECT COUNT(pp) FROM ProcedureProduct pp WHERE pp.procedure.id = :procedureId")
    Integer countProductsByProcedureId(@Param("procedureId") Long procedureId);

    // Cost statistics for procedure
    @Query("SELECT AVG(pp.cost), MIN(pp.cost), MAX(pp.cost) FROM ProcedureProduct pp WHERE pp.procedure.id = :procedureId AND pp.cost IS NOT NULL")
    Object[] calculateCostStatsByProcedureId(@Param("procedureId") Long procedureId);

    // Average product selling price for products using this procedure
    @Query("SELECT AVG(p.finalSellingPriceRetail) FROM ProcedureProduct pp JOIN pp.product p WHERE pp.procedure.id = :procedureId AND p.finalSellingPriceRetail IS NOT NULL")
    BigDecimal calculateAverageProductPriceByProcedureId(@Param("procedureId") Long procedureId);

    // Category distribution for procedure
    @Query(value = """
    SELECT c.id, c.name, COUNT(*) as productCount,
           (COUNT(*) * 100.0 / :totalProducts) as percentage
    FROM procedure_product pp
    JOIN products p ON pp.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE pp.procedure_id = :procedureId
    GROUP BY c.id, c.name
    ORDER BY COUNT(*) DESC
    """, nativeQuery = true)
    List<Object[]> calculateCategoryDistributionByProcedureId(
            @Param("procedureId") Long procedureId,
            @Param("totalProducts") Integer totalProducts
    );

    @Query("SELECT COUNT(s) FROM Sale s JOIN s.saleProducts sp JOIN sp.product.procedureProducts pp WHERE pp.procedure.id = :procedureId")
    Integer countSalesByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.procedureProducts pp WHERE pp.procedure.id = :procedureId")
    BigDecimal sumRevenueByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s JOIN s.saleProducts sp JOIN sp.product.procedureProducts pp WHERE pp.procedure.id = :procedureId")
    LocalDate findLastSaleDateByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT COUNT(s) FROM Sale s JOIN s.saleProducts sp JOIN sp.product.procedureProducts pp WHERE pp.procedure.id = :procedureId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProcedureIdAndDateRange(@Param("procedureId") Long procedureId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s JOIN sp.product.procedureProducts pp WHERE pp.procedure.id = :procedureId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProcedureIdAndDateRange(@Param("procedureId") Long procedureId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    /**
     * Top products using this procedure (for usage distribution in detailed view)
     * Orders by product price cost descending
     */
    @Query("SELECT p.id, p.name, p.code, pp.cost, " +
            "CASE WHEN p.category IS NOT NULL THEN p.category.name ELSE 'No Category' END " +
            "FROM Product p JOIN p.procedureProducts pp JOIN pp.procedure proc " +
            "WHERE proc.id = :procedureId " +
            "ORDER BY p.finalSellingPriceRetail DESC")  // ← Sort by product price
    List<Object[]> findTopProductsByProcedureUsage(@Param("procedureId") Long procedureId, Pageable pageable);

}
