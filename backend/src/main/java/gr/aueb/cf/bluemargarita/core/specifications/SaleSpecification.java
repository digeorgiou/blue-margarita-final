package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class SaleSpecification {

    private SaleSpecification() {
        // Utility class
    }

    /**
     * Filter sales by date range
     */
    public static Specification<Sale> hasDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (startDate == null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("saleDate"), endDate);
            }
            if (endDate == null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("saleDate"), startDate);
            }
            return criteriaBuilder.between(root.get("saleDate"), startDate, endDate);
        };
    }

    /**
     * Filter sales by customer ID
     */
    public static Specification<Sale> hasCustomerId(Long customerId) {
        return (root, query, criteriaBuilder) -> {
            if (customerId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            Join<Sale, Customer> customerJoin = root.join("customer", JoinType.LEFT);
            return criteriaBuilder.equal(customerJoin.get("id"), customerId);
        };
    }

    /**
     * Filter sales by location
     */
    public static Specification<Sale> hasLocationId(Long locationId) {
        return (root, query, criteriaBuilder) -> {
            if (locationId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            Join<Sale, Location> locationJoin = root.join("location", JoinType.INNER);
            return criteriaBuilder.equal(locationJoin.get("id"), locationId);
        };
    }

    /**
     * Filter sales by product category
     */
    public static Specification<Sale> hasCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            // Join Sale -> SaleProduct -> Product -> Category
            Join<Sale, SaleProduct> saleProductJoin = root.join("saleProducts", JoinType.INNER);
            Join<SaleProduct, Product> productJoin = saleProductJoin.join("product", JoinType.INNER);
            Join<Product, Category> categoryJoin = productJoin.join("category", JoinType.INNER);

            return criteriaBuilder.equal(categoryJoin.get("id"), categoryId);
        };
    }

    /**
     * Filter sales by payment method
     */
    public static Specification<Sale> hasPaymentMethod(PaymentMethod paymentMethod) {
        return (root, query, criteriaBuilder) -> {
            if (paymentMethod == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            return criteriaBuilder.equal(root.get("paymentMethod"), paymentMethod);
        };
    }

    /**
     * Filter sales by specific product ID (when user selects from autocomplete)
     */
    public static Specification<Sale> hasProductId(Long productId) {
        return (root, query, criteriaBuilder) -> {
            if (productId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            Join<Sale, SaleProduct> saleProductJoin = root.join("saleProducts", JoinType.INNER);
            Join<SaleProduct, Product> productJoin = saleProductJoin.join("product", JoinType.INNER);

            return criteriaBuilder.equal(productJoin.get("id"), productId);
        };
    }

    public static Specification<Sale> isWholesale(Boolean isWholesale) {
        return (root, query, criteriaBuilder) -> {
            if (isWholesale == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isWholesale"), isWholesale);
        };
    }

}
