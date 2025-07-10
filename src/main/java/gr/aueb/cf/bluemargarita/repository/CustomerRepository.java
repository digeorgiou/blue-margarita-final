package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>,
        JpaSpecificationExecutor<Customer> {
    boolean existsByEmail(String email);
    boolean existsByTin(String tin);
    List<Customer> findByIsActiveTrue();
   Optional<Customer> findByEmail(String email);
   Optional<Customer> findByTin(String tin);
   Integer countByIsActiveTrue();
   Integer countByFirstSaleDateBetween(LocalDate startDate, LocalDate endDate);

}
