package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>,
        JpaSpecificationExecutor<Customer> {
    boolean existsByEmail(String email);
    boolean existsByTin(String tin);

    Page<Customer> findByGender(GenderType gender, Pageable pageable);
    Page<Customer> findByIsActive(Boolean isActive, Pageable pageable);

    Long countByIsActive(Boolean isActive);
    Long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);


}
