package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>,
        JpaSpecificationExecutor<Sale> {
}
