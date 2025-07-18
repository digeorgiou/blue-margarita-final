package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>,
        JpaSpecificationExecutor<Category> {
    boolean existsByName(String name);
    List<Category> findByIsActiveTrue();

    @Query("SELECT c.name FROM Category c WHERE c.id = :categoryId")
    String findCategoryNameById(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    Integer countActiveProductsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT AVG(p.suggestedRetailSellingPrice) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    BigDecimal calculateAverageRetailPriceByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    Integer countSalesByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    BigDecimal sumRevenueByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s JOIN s.saleProducts sp WHERE sp.product.category.id = :categoryId")
    LocalDate findLastSaleDateByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(s) FROM Sale s JOIN s.saleProducts sp WHERE sp.product.category.id = :categoryId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByCategoryIdAndDateRange(@Param("categoryId") Long categoryId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.category.id = :categoryId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByCategoryIdAndDateRange(@Param("categoryId") Long categoryId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);
}
