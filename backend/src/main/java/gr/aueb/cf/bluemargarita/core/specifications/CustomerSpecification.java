package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.Sale;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CustomerSpecification {

    private CustomerSpecification () {

    }

    public static Specification<Customer> customerIsActive(Boolean isActive) {
        return((root, query, criteriaBuilder) -> {
           if(isActive == null) return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
           return criteriaBuilder.equal(root.get("isActive"), isActive);
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

    /**
     * Specification for multi-field search (lastname, phone, tin, email)
     */

    public static Specification<Customer> searchMultipleFields(String searchTerm) {
        return (root, query , criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            String likePattern = "%" + searchTerm.toUpperCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("lastname")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("phoneNumber")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("tin")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("email")), likePattern)
            );
        };
    }

    /**
     * Specification for wholesale customers (customers with TIN)
     */

    public static Specification<Customer> wholeSaleCustomersOnly(Boolean wholesaleOnly){
        return(root, query, criteriaBuilder) -> {
            if(wholesaleOnly == null || !wholesaleOnly){
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            return criteriaBuilder.isNotNull(root.get("tin"));
        };
    }

}
