package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Category;
import gr.aueb.cf.bluemargarita.model.Product;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    private ProductSpecification() {
        // Utility class
    }

    public static Specification<Product> productNameLike(String name) {
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

    public static Specification<Product> productCodeLike(String code) {
        return (root, query, criteriaBuilder) -> {
            if (code == null || code.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("code")),
                    "%" + code.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Product> productCategoryNameLike(String categoryName) {
        return (root, query, criteriaBuilder) -> {
            if (categoryName == null || categoryName.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            Join<Product, Category> categoryJoin = root.join("category");
            return criteriaBuilder.like(
                    criteriaBuilder.upper(categoryJoin.get("name")),
                    "%" + categoryName.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Product> productCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            Join<Product, Category> categoryJoin = root.join("category");
            return criteriaBuilder.equal(categoryJoin.get("id"), categoryId);
        };
    }

    public static Specification<Product> productPriceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (minPrice != null && maxPrice != null) {
                return criteriaBuilder.between(root.get("finalSellingPrice"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("finalSellingPrice"), minPrice);
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("finalSellingPrice"), maxPrice);
        };
    }

    public static Specification<Product> productStockBetween(Integer minStock, Integer maxStock) {
        return (root, query, criteriaBuilder) -> {
            if (minStock == null && maxStock == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (minStock != null && maxStock != null) {
                return criteriaBuilder.between(root.get("stock"), minStock, maxStock);
            }
            if (minStock != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("stock"), minStock);
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("stock"), maxStock);
        };
    }

    public static Specification<Product> productIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<Product> productLowStock(Boolean lowStock) {
        return (root, query, criteriaBuilder) -> {
            if (lowStock == null || !lowStock) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            // Products where stock <= lowStockAlert
            return criteriaBuilder.lessThanOrEqualTo(
                    root.get("stock"),
                    root.get("lowStockAlert")
            );
        };
    }

    public static Specification<Product> productStringFieldLike(String field, String value) {
        return (root, query, criteriaBuilder) -> {
            if (value == null || value.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get(field)),
                    "%" + value.toUpperCase() + "%"
            );
        };
    }
}
