package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Material;
import gr.aueb.cf.bluemargarita.model.Purchase;
import gr.aueb.cf.bluemargarita.model.PurchaseMaterial;
import gr.aueb.cf.bluemargarita.model.Supplier;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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
            Join<Purchase, Supplier> supplierJoin = root.join("supplier");
            return criteriaBuilder.equal(supplierJoin.get("id"), supplierId);
        };
    }

    public static Specification<Purchase> purchaseSupplierNameOrTinOrEmailLike(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return null;
            }
            Join<Purchase, Supplier> supplierJoin = root.join("supplier", JoinType.LEFT);
            String upperSearchTerm = "%" + searchTerm.toUpperCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.upper(supplierJoin.get("name")), upperSearchTerm),
                    criteriaBuilder.like(criteriaBuilder.upper(supplierJoin.get("tin")), upperSearchTerm),
                    criteriaBuilder.like(criteriaBuilder.upper(supplierJoin.get("email")), upperSearchTerm)
            );
        };
    }

    public static Specification<Purchase> purchaseContainsMaterial(String materialName) {
        return (root, query, criteriaBuilder) -> {
            if (materialName == null || materialName.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            Join<Purchase, PurchaseMaterial> purchaseMaterialJoin = root.join("purchaseMaterials", JoinType.INNER);
            Join<PurchaseMaterial, Material> materialJoin = purchaseMaterialJoin.join("material", JoinType.INNER);

            String searchTerm = "%" + materialName.trim().toUpperCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.upper(materialJoin.get("name")), searchTerm)
            );
        };
    }

    public static Specification<Purchase> purchaseContainsMaterialId(Long materialId){
        return (root, query, criteriaBuilder) -> {
            if(materialId == null){
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            Join<Purchase, PurchaseMaterial> purchaseMaterialJoin = root.join("purchaseMaterials", JoinType.INNER);
            Join<PurchaseMaterial, Material> materialJoin = purchaseMaterialJoin.join("material", JoinType.INNER);

            return criteriaBuilder.equal(materialJoin.get("id"), materialId);
        };
    }
}
