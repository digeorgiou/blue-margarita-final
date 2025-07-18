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

    // Basic counts
    Integer countByProcedureId(Long procedureId);
    Integer countByProductId(Long productId);

    // Find relationships
    List<ProductProcedure> findByProcedureId(Long procedureId);
    List<ProductProcedure> findByProductId(Long productId);

    // Cost calculations
    @Query("SELECT COALESCE(AVG(pp.cost), 0) FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId")
    BigDecimal calculateAverageCostByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT COALESCE(SUM(pp.cost), 0) FROM ProductProcedure pp WHERE pp.procedure.id = :procedureId")
    BigDecimal sumCostByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT pp.cost FROM ProductProcedure pp WHERE pp.product.id = :productId AND pp.procedure.id = :procedureId")
    BigDecimal findCostByProductIdAndProcedureId(@Param("productId") Long productId, @Param("procedureId") Long procedureId);

    // For category distribution
    @Query("SELECT COUNT(pp) FROM ProductProcedure pp JOIN pp.product p WHERE p.category.id = :categoryId AND pp.procedure.id = :procedureId")
    Integer countByCategoryIdAndProcedureId(@Param("categoryId") Long categoryId, @Param("procedureId") Long procedureId);

    @Query("SELECT COALESCE(SUM(pp.cost), 0) FROM ProductProcedure pp WHERE pp.product.id = :productId")
    BigDecimal sumCostByProductId(@Param("productId") Long productId);
}
