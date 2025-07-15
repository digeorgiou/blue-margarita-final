package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Category;
import gr.aueb.cf.bluemargarita.model.Procedure;
import gr.aueb.cf.bluemargarita.model.ProcedureProduct;
import gr.aueb.cf.bluemargarita.model.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public class ProcedureSpecification {

    private ProcedureSpecification() {
        // Utility class
    }

    public static Specification<Procedure> procedureNameLike(String name) {
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

    public static Specification<Procedure> procedureIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

}
