package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>,
        JpaSpecificationExecutor<Category> {
    boolean existsByName(String name);
    List<Category> findByIsActiveTrue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    Integer countActiveProductsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT AVG(p.sellingPriceRetail) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    BigDecimal calculateAverageRetailPriceByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    Integer countSalesByCategoryId(@Param("categoryId") Long categoryId);
}
