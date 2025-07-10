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

    public static Specification<Customer> hasSalesInDateRange(LocalDate startDate, LocalDate endDate) {
        return(root, query, criteriaBuilder) -> {
            Join<Customer, Sale> saleJoin = root.join("sales", JoinType.INNER);
            return criteriaBuilder.between(saleJoin.get("saleDate"), startDate, endDate);
        };
    }

    /**
     * Specification for multi-field search
     */
    public static Specification<Customer> searchByTerm(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction(); // Always true
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            List<Predicate> searchPredicates = new ArrayList<>();
            searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("firstname")), likePattern));
            searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("lastname")), likePattern));
            searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), likePattern));
            searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("phoneNumber")), likePattern));
            searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("tin")), likePattern));

            return criteriaBuilder.or(searchPredicates.toArray(new Predicate[0]));
        };

    }

    /**
     * Specification for customers with first sale in date range
     */
    public static Specification<Customer> firstSaleInDateRange(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.between(root.get("firstSaleDate"), startDate, endDate);
    }

    /**
     * specification for customers with sales in date range, grouped and ordered by revenue
     */
    public static Specification<Customer> withSalesInDateRangeForRevenue(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            // Join with sales
            Join<Customer, Sale> saleJoin = root.join("sales", JoinType.INNER);

            // Add predicates
            Predicate activePredicate = criteriaBuilder.equal(root.get("isActive"), true);
            Predicate datePredicate = criteriaBuilder.between(saleJoin.get("saleDate"), startDate, endDate);
            Predicate priceNotNull = criteriaBuilder.isNotNull(saleJoin.get("finalPrice"));

            // Group by customer
            query.groupBy(root.get("id"));

            // Order by sum of revenue (descending)
            query.orderBy(criteriaBuilder.desc(criteriaBuilder.sum(saleJoin.get("finalPrice"))));

            return criteriaBuilder.and(activePredicate, datePredicate, priceNotNull);
        };
    }

    /**
     * specification for customers with sales in date range, grouped and ordered by order count
     */
    public static Specification<Customer> withSalesInDateRangeForOrderCount(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            // Join with sales
            Join<Customer, Sale> saleJoin = root.join("sales", JoinType.INNER);

            // Add predicates
            Predicate activePredicate = criteriaBuilder.equal(root.get("isActive"), true);
            Predicate datePredicate = criteriaBuilder.between(saleJoin.get("saleDate"), startDate, endDate);

            // Group by customer
            query.groupBy(root.get("id"));

            // Order by count of sales (descending)
            query.orderBy(criteriaBuilder.desc(criteriaBuilder.count(saleJoin.get("id"))));

            return criteriaBuilder.and(activePredicate, datePredicate);
        };
    }



}
