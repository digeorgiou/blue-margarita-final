package gr.aueb.cf.bluemargarita.model;

import jakarta.persistence.*;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE products SET is_active = false WHERE id = ?")
@FilterDef(name = "activeProductsFilter", parameters = @ParamDef(name =
        "isActive", type = Boolean.class))
@Filter(name = "activeProductsFilter", condition = "is_active = :isActive")
@Table(name = "products")
public class Product extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(name = "suggested_retail_selling_price", precision = 10, scale = 2)
    private BigDecimal suggestedRetailSellingPrice;

    @Column(name = "suggested_wholesale_selling_price")
    private BigDecimal suggestedWholeSaleSellingPrice;

    @Column(name = "final_selling_price", precision = 10, scale = 2)
    private BigDecimal finalSellingPrice;

    @Column(name = "minutes_to_make")
    private Integer minutesToMake;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "low_stock_alert")
    private Integer lowStockAlert;

    @ColumnDefault("true")
    @Column(name = "is_active")
    private Boolean isActive= true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /* we don't want SaleProducts to be deleted if a product is deleted,
    because we would lose the sale info (product name, quantity, price etc)
     */
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<SaleProduct> saleProducts = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,  orphanRemoval = true)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<ProcedureProduct> procedureProducts = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<ProductMaterial> productMaterials = new HashSet<>();

    public Set<ProductMaterial> getAllProductMaterials() {
        if(productMaterials == null) productMaterials = new HashSet<>();
        return Collections.unmodifiableSet(productMaterials);
    }

    public Set<ProcedureProduct> getAllProcedureProducts(){
        if(procedureProducts == null) procedureProducts = new HashSet<>();
        return Collections.unmodifiableSet(procedureProducts);
    }

    public Set<SaleProduct> getAllSaleProducts(){
        if(saleProducts == null) saleProducts = new HashSet<>();
        return Collections.unmodifiableSet(saleProducts);
    }

    // Helper Methods

    public void addMaterial(Material material , BigDecimal quantity) {
        ProductMaterial productMaterial = new ProductMaterial();
        productMaterial.setQuantity(quantity);
        productMaterial.setProduct(this);
        material.addProductMaterial(productMaterial);
        productMaterials.add(productMaterial);
    }

    public void removeMaterial(Material material){
        if(productMaterials == null) return;

        ProductMaterial toRemove = productMaterials.stream()
                .filter(pm -> pm.getMaterial().equals(material))
                .findFirst()
                .orElse(null);

        if(toRemove != null){
            productMaterials.remove(toRemove);
            material.removeProductMaterial(toRemove);
        }

    }

    public void addProcedure(Procedure procedure, BigDecimal cost) {
        ProcedureProduct procedureProduct = new ProcedureProduct();
        procedureProduct.setCost(cost);
        procedureProduct.setProduct(this);
        procedure.addProcedureProduct(procedureProduct);
        procedureProducts.add(procedureProduct);
    }

    public void removeProcedure(Procedure procedure){
        if(procedureProducts == null) return;

        ProcedureProduct toRemove = procedureProducts.stream()
                .filter(pp -> pp.getProcedure().equals(procedure))
                .findFirst()
                .orElse(null);

        if(toRemove != null) {
            procedureProducts.remove(toRemove);
            procedure.removeProcedureProduct(toRemove);
        }
    }

    public void addSaleProduct(SaleProduct saleProduct) {
        if(saleProducts == null) saleProducts = new HashSet<>();
        saleProducts.add(saleProduct);
        saleProduct.setProduct(this);
    }

    public void removeSaleProduct(SaleProduct saleProduct){
        if(saleProducts == null) return;
        saleProducts.remove(saleProduct);
        saleProduct.setProduct(null);
    }

    public void addSale(Sale sale, BigDecimal quantity){
        sale.addProduct(this, quantity);
    }

    public void removeSale(Sale sale){
        sale.removeProduct(this);
    }
}
