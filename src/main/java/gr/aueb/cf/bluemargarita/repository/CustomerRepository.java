package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>,
        JpaSpecificationExecutor<Customer> {
    boolean existsByEmail(String email);
    boolean existsByTin(String tin);
    boolean existsByPhoneNumber(String phoneNumber);
    List<Customer> findByIsActiveTrue();

    @Query("SELECT CONCAT(c.firstname, ' ', c.lastname) FROM Customer c WHERE c.id = :customerId")
    String findCustomerNameById(@Param("customerId") Long customerId);

    @Query("SELECT c.email FROM Customer c WHERE c.id = :customerId")
    String findCustomerEmailById(@Param("customerId") Long customerId);
}
