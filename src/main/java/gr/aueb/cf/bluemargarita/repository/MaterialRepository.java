package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long>,
        JpaSpecificationExecutor<Material> {
    boolean existsByDescription(String description);
}
