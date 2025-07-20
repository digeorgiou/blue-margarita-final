package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.ProductProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductProcedureRepository extends JpaRepository<ProductProcedure,Long>,
        JpaSpecificationExecutor<ProductProcedure> {

    // =============================================================================
    // PROCEDURE QUERIES
    // =============================================================================

    Integer countByProcedureId(Long procedureId);
    Integer countByProductId(Long productId);

    // =============================================================================
    // COST CALCULATIONS
    // =============================================================================

    @Query("SELECT COALESCE(AVG(pp.cost), 0) FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId")
    BigDecimal calculateAverageCostByProcedureId(@Param("procedureId") Long procedureId);

    // =============================================================================
    // PRODUCT + PROCEDURE
    // =============================================================================

    @Query("SELECT pp.cost FROM ProductProcedure pp WHERE pp.product.id = :productId AND pp.procedure.id = :procedureId")
    BigDecimal findCostByProductIdAndProcedureId(@Param("productId") Long productId, @Param("procedureId") Long procedureId);

    @Query("SELECT COALESCE(SUM(pp.cost), 0) FROM ProductProcedure pp WHERE pp.product.id = :productId")
    BigDecimal sumCostByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(pp.product.finalSellingPriceRetail) FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId AND pp.product.finalSellingPriceRetail IS NOT NULL")
    BigDecimal calculateAverageProductPriceByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT pp.product.id FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId AND pp.product.isActive = true")
    List<Long> findProductIdsByProcedureId(@Param("procedureId") Long procedureId);

    // =============================================================================
    // CATEGORY + PROCEDURE
    // =============================================================================

    @Query("SELECT COUNT(pp) FROM ProductProcedure pp JOIN pp.product p WHERE p.category.id = :categoryId AND pp.procedure.id = :procedureId")
    Integer countByCategoryIdAndProcedureId(@Param("categoryId") Long categoryId, @Param("procedureId") Long procedureId);

    @Query("SELECT DISTINCT pp.product.category.id FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId AND pp.product.category IS NOT NULL AND pp.product.isActive = true")
    List<Long> findCategoryIdsByProcedureId(@Param("procedureId") Long procedureId);




}
