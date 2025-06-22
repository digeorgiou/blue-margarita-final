package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LocationRepository extends JpaRepository<Location, Long>,
        JpaSpecificationExecutor<Location> {
}
