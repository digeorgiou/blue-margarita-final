package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>,
        JpaSpecificationExecutor<Supplier> {
    boolean existsByName(String name);
    boolean existsByTin(String tin);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    List<Supplier> findByIsActiveTrue();
}
