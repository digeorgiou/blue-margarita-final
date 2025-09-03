package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    private UserSpecification () {

    }

    public static Specification<User> usernameLike(String username){
        return (root, query, criteriaBuilder) -> {
            if (username == null || username.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("username")),
                    "%" + username.toUpperCase() + "%"
            );
        };
    }

    public static Specification<User> userIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }
}
