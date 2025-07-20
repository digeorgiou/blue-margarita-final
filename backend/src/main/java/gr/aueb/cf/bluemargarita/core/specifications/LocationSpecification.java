package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Location;
import org.springframework.data.jpa.domain.Specification;

public class LocationSpecification {

    private LocationSpecification() {
        // Utility class
    }

    public static Specification<Location> locationNameLike(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("name")),
                    "%" + name.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Location> locationIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }
}
