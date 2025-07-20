package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.Supplier;
import org.springframework.data.jpa.domain.Specification;

public class SupplierSpecification {

    private SupplierSpecification() {
        // Utility class
    }

    public static Specification<Supplier> supplierNameLike(String name) {
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

    public static Specification<Supplier> supplierEmailLike(String email) {
        return (root, query, criteriaBuilder) -> {
            if (email == null || email.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("email")),
                    "%" + email.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Supplier> supplierTinLike(String tin) {
        return (root, query, criteriaBuilder) -> {
            if (tin == null || tin.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("tin")),
                    "%" + tin.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Supplier> supplierPhoneNumberLike(String phoneNumber) {
        return (root, query, criteriaBuilder) -> {
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("phoneNumber")),
                    "%" + phoneNumber.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Supplier> supplierAddressLike(String address) {
        return (root, query, criteriaBuilder) -> {
            if (address == null || address.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("address")),
                    "%" + address.toUpperCase() + "%"
            );
        };
    }

    public static Specification<Supplier> supplierIsActive(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    /**
     * Specification for multi-field search (lastname, phone, tin, email)
     */

    public static Specification<Supplier> searchMultipleFields(String searchTerm) {
        return (root, query , criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            String likePattern = "%" + searchTerm.toUpperCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("name")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("phoneNumber")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("tin")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("email")), likePattern)
            );
        };
    }

}
