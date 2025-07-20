package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Category;
import gr.aueb.cf.bluemargarita.model.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class CategorySpecification {

    private CategorySpecification() {
        // Utility class
    }

    public static Specification<Category> categoryNameLike(String name) {
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

    public static Specification<Category> categoryIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

}
