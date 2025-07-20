package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long>,
        JpaSpecificationExecutor<Location> {
    boolean existsByName(String name);
    List<Location> findByIsActiveTrue();

    @Query("SELECT l.name FROM Location l WHERE l.id = :locationId")
    String findLocationNameById(@Param("locationId") Long locationId);
}
