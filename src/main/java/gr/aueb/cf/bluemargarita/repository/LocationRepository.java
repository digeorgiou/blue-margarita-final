package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long>,
        JpaSpecificationExecutor<Location> {
    boolean existsByName(String name);
    List<Location> findByIsActiveTrue();
}
