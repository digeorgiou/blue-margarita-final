package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.SaleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleProductRepository extends JpaRepository<SaleProduct, Long>,
        JpaSpecificationExecutor<SaleProduct> {
}
