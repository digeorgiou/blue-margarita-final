package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Customer;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public class CustomerSpecification {

    private CustomerSpecification () {

    }

    public static Specification<Customer> customerEmailIs(String email) {
        return((root, query, criteriaBuilder) -> {
           if(email == null || email.isBlank()) {
               return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
           }
           return criteriaBuilder.equal(root.get("email"), email);
        });
    }

    public static Specification<Customer> customerIsActive(Boolean isActive) {
        return((root, query, criteriaBuilder) -> {
           if(isActive == null) return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
           return criteriaBuilder.equal(root.get("isActive"), isActive);
        });
    }

    public static Specification<Customer> customerLastnameIs(String lastname) {
        return((root, query, criteriaBuilder) -> {
            if(lastname == null || lastname.isBlank()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("lastname"), lastname);
        });
    }

    public static Specification<Customer> customerStringFieldLike(String field, String value){
        return((root, query, criteriaBuilder) -> {
            if(value == null || value.trim().isEmpty()){
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(criteriaBuilder.upper(root.get(field)),
                    "%" + value.toUpperCase() + "%");
        });
    }
}
