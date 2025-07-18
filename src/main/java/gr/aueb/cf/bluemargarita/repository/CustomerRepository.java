package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>,
        JpaSpecificationExecutor<Customer> {
    boolean existsByEmail(String email);
    boolean existsByTin(String tin);
    boolean existsByPhoneNumber(String phoneNumber);
    List<Customer> findByIsActiveTrue();
   Optional<Customer> findByEmail(String email);
   Optional<Customer> findByTin(String tin);
   Integer countByIsActiveTrue();

    // Basic customer sales metrics
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId")
    Integer countSalesByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.customer.id = :customerId")
    BigDecimal sumRevenueByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.customer.id = :customerId")
    LocalDate findLastSaleDateByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByCustomerIdAndDateRange(@Param("customerId") Long customerId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);


    // Top products for customer (returns aggregated data, not full entities)
    @Query(value = """
    SELECT p.id, p.name, p.code,
           SUM(sp.quantity) as totalQuantity,
           SUM(sp.quantity * sp.price_at_the_time) as totalRevenue,
           MAX(s.sale_date) as lastSaleDate
    FROM sales s 
    JOIN sale_product sp ON s.id = sp.sale_id
    JOIN products p ON sp.product_id = p.id
    WHERE s.customer_id = :customerId 
    GROUP BY p.id, p.name, p.code 
    ORDER BY SUM(sp.quantity * sp.price_at_the_time) DESC
    LIMIT 5
    """, nativeQuery = true)
    List<Object[]> findTopProductsByCustomerId(@Param("customerId") Long customerId);

}
