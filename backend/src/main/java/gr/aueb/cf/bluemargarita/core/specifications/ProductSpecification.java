package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.model.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    private ProductSpecification() {
        // Utility class
    }

    /**
     * Filter products that belongs to a specific category by id (for dropdown selection)
     */

    public static Specification<Product> productCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            Join<Product, Category> categoryJoin = root.join("category");
            return criteriaBuilder.equal(categoryJoin.get("id"), categoryId);
        };
    }

    /**
     * Filter products that contain a specific material by name (for search bar)
     */

    public static Specification<Product> productContainsMaterialByName(String materialName) {
        return (root, query, criteriaBuilder) -> {
            if (materialName == null || materialName.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            // Join Product -> ProductMaterial -> Material
            Join<Product, ProductMaterial> productMaterialJoin = root.join("productMaterials", JoinType.INNER);
            Join<ProductMaterial, Material> materialJoin = productMaterialJoin.join("material", JoinType.INNER);

            return criteriaBuilder.like(
                    criteriaBuilder.upper(materialJoin.get("name")),
                    "%" + materialName.toUpperCase() + "%"
            );
        };
    }

    /**
     * Filter products that contain a specific material by ID (when user selects from dropdown)
     */
    public static Specification<Product> productContainsMaterialById(Long materialId) {
        return (root, query, criteriaBuilder) -> {
            if (materialId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            Join<Product, ProductMaterial> productMaterialJoin = root.join("productMaterials", JoinType.INNER);
            Join<ProductMaterial, Material> materialJoin = productMaterialJoin.join("material", JoinType.INNER);

            return criteriaBuilder.equal(materialJoin.get("id"), materialId);
        };
    }

    public static Specification<Product> productRetailPriceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (minPrice != null && maxPrice != null) {
                return criteriaBuilder.between(root.get("finalSellingPriceRetail"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("finalSellingPriceRetail"), minPrice);
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("finalSellingPriceRetail"), maxPrice);
        };
    }

    /**
     * Filter products that use a specific procedure by ID (for dropdown selection)
     */
    public static Specification<Product> productUsesProcedureById(Long procedureId) {
        return (root, query, criteriaBuilder) -> {
            if (procedureId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            // Join Product -> ProcedureProduct -> Procedure
            Join<Product, ProductProcedure> procedureProductJoin = root.join("productProcedures", JoinType.INNER);
            Join<ProductProcedure, Procedure> procedureJoin = procedureProductJoin.join("procedure", JoinType.INNER);

            return criteriaBuilder.equal(procedureJoin.get("id"), procedureId);
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
            Predicate predicate = criteriaBuilder.lessThanOrEqualTo(
                    root.get("stock"),
                    root.get("lowStockAlert")
            );

            return predicate;
        };
    }

    /**
     * Combined specification for product search (name OR productCode)
     */
    public static Specification<Product> productNameOrCodeLike(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            String upperSearchTerm = "%" + searchTerm.toUpperCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("name")), upperSearchTerm),
                    criteriaBuilder.like(criteriaBuilder.upper(root.get("code")), upperSearchTerm)
            );
        };
    }

    public static Specification<Product> hasProductMaterial(Long materialId) {
        return (root, query, criteriaBuilder) -> {
            if (materialId == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            Join<Product, ProductMaterial> productMaterialJoin = root.join("productMaterials");
            Join<ProductMaterial, Material> materialJoin = productMaterialJoin.join("material");

            return criteriaBuilder.equal(materialJoin.get("id"), materialId);
        };
    }

    public static Specification<Product> hasProcedureProduct(Long procedureId){
        return (root, query, criteriaBuilder) -> {
            if(procedureId == null){
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            Join<Product, ProductProcedure> procedureProductJoin = root.join("procedureProducts");
            Join<ProductProcedure, Procedure> procedureJoin = procedureProductJoin.join("procedure");

            return criteriaBuilder.equal(procedureJoin.get("id"), procedureId);
        };
    }



}
