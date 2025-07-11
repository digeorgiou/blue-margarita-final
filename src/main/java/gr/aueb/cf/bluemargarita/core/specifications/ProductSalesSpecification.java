package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.SaleProduct;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;

public class ProductSalesSpecification {

    private ProductSalesSpecification() {
        // Utility class
    }

    // Base specification for product sales in date range
    public static Specification<SaleProduct> productInDateRange(Long productId, LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            var predicates = new ArrayList<Predicate>();

            if (productId != null) {
                predicates.add(criteriaBuilder.equal(root.get("product").get("id"), productId));
            }

            if (startDate != null || endDate != null) {
                var saleJoin = root.join("sale");
                if (startDate != null && endDate != null) {
                    predicates.add(criteriaBuilder.between(saleJoin.get("saleDate"), startDate, endDate));
                } else if (startDate != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(saleJoin.get("saleDate"), startDate));
                } else {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(saleJoin.get("saleDate"), endDate));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Specification for grouping by date (for daily sales)
    public static Specification<SaleProduct> groupByDateForProduct(Long productId, LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            var saleJoin = root.join("sale");

            // Group by sale date
            query.groupBy(saleJoin.get("saleDate"));

            // Order by date
            query.orderBy(criteriaBuilder.asc(saleJoin.get("saleDate")));

            return productInDateRange(productId, startDate, endDate).toPredicate(root, query, criteriaBuilder);
        };
    }

    // Specification for grouping by location
    public static Specification<SaleProduct> groupByLocationForProduct(Long productId, LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            var saleJoin = root.join("sale");
            var locationJoin = saleJoin.join("location");

            // Group by location
            query.groupBy(locationJoin.get("id"), locationJoin.get("name"));

            return productInDateRange(productId, startDate, endDate).toPredicate(root, query, criteriaBuilder);
        };
    }

    // Specification for grouping by customer
    public static Specification<SaleProduct> groupByCustomerForProduct(Long productId, LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            var saleJoin = root.join("sale");
            var customerJoin = saleJoin.join("customer");

            // Group by customer
            query.groupBy(customerJoin.get("id"), customerJoin.get("firstname"),
                    customerJoin.get("lastname"), customerJoin.get("email"));

            return productInDateRange(productId, startDate, endDate).toPredicate(root, query, criteriaBuilder);
        };
    }
}
