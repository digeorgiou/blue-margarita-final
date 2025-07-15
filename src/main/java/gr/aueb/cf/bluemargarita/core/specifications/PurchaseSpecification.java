package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Purchase;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PurchaseSpecification {

    public static Specification<Purchase> purchaseDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) {
                return null;
            }
            if (startDate == null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("purchaseDate"), endDate);
            }
            if (endDate == null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("purchaseDate"), startDate);
            }
            return criteriaBuilder.between(root.get("purchaseDate"), startDate, endDate);
        };
    }

    public static Specification<Purchase> purchaseSupplierId(Long supplierId) {
        return (root, query, criteriaBuilder) -> {
            if (supplierId == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("supplier").get("id"), supplierId);
        };
    }

    public static Specification<Purchase> purchaseSupplierNameLike(String supplierName) {
        return (root, query, criteriaBuilder) -> {
            if (supplierName == null || supplierName.trim().isEmpty()) {
                return null;
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("supplier").get("name")),
                    "%" + supplierName.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Purchase> purchaseTotalCostBetween(BigDecimal minCost, BigDecimal maxCost) {
        return (root, query, criteriaBuilder) -> {
            if (minCost == null && maxCost == null) {
                return null;
            }
            if (minCost == null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("totalCost"), maxCost);
            }
            if (maxCost == null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("totalCost"), minCost);
            }
            return criteriaBuilder.between(root.get("totalCost"), minCost, maxCost);
        };
    }

    public static Specification<Purchase> purchaseContainsMaterial(String materialName) {
        return (root, query, criteriaBuilder) -> {
            if (materialName == null || materialName.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.join("purchaseMaterials")
                                    .join("material")
                                    .get("name")
                    ),
                    "%" + materialName.toLowerCase() + "%"
            );
        };
    }
}
