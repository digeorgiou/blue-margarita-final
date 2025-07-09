package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);
    boolean existsByCode(String code);
    List<Product> findByIsActiveTrue();
}
