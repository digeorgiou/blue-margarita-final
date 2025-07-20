package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long>,
        JpaSpecificationExecutor<Material> {
    boolean existsByName(String name);
    List<Material> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    @Query("SELECT m.name FROM Material m WHERE m.id = :materialId")
    String findMaterialNameById(@Param("materialId") Long materialId);

    @Query("SELECT m.costPerUnit FROM Material m WHERE m.id = :materialId")
    BigDecimal findCostPerUnitById(@Param("materialId") Long materialId);

}
