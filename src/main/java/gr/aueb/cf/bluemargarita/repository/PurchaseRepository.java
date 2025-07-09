package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long>,
        JpaSpecificationExecutor<Purchase> {
}
