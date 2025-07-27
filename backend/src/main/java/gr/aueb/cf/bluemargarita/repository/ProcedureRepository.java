package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Procedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, Long>,
        JpaSpecificationExecutor<Procedure> {
    boolean existsByName(String name);
    List<Procedure> findByIsActiveTrue();
    List<Procedure> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
