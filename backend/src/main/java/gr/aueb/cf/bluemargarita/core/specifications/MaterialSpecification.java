package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Material;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class MaterialSpecification {

    private MaterialSpecification() {
        // Utility class
    }

    public static Specification<Material> materialNameLike(String name) {
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

    public static Specification<Material> materialIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

}
