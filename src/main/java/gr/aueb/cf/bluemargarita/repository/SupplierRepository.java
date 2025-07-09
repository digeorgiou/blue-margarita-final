package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>,
        JpaSpecificationExecutor<Supplier> {
    boolean existsByTin(String tin);
    boolean existsByEmail(String email);
}
