package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {

    List<User> findByIsActiveTrue();
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
