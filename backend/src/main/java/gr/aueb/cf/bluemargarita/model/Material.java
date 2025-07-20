package gr.aueb.cf.bluemargarita.model;

import jakarta.persistence.*;
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
@Table(name = "materials")
public class Material extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "current_unit_cost", precision = 10, scale = 2)
    private BigDecimal currentUnitCost;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure; // e.g., "grams", "pieces", "meters"

    @ColumnDefault("true")
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive= true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "material", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<PurchaseMaterial> purchaseMaterials = new HashSet<>();

    @OneToMany(mappedBy = "material", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<ProductMaterial> productMaterials = new HashSet<>();

    public Set<PurchaseMaterial> getAllPurchaseMaterials(){
        if (purchaseMaterials == null) purchaseMaterials = new HashSet<>();
        return Collections.unmodifiableSet(purchaseMaterials);
    }

    public Set<ProductMaterial> getAllProductMaterials(){
        if (productMaterials == null) productMaterials = new HashSet<>();
        return Collections.unmodifiableSet(productMaterials);
    }

    public void addPurchaseMaterial(PurchaseMaterial purchaseMaterial){
        if(purchaseMaterials == null) purchaseMaterials = new HashSet<>();
        purchaseMaterials.add(purchaseMaterial);
        purchaseMaterial.setMaterial(this);
    }

    public void removePurchaseMaterial(PurchaseMaterial purchaseMaterial){
        if(purchaseMaterials == null) return;
        purchaseMaterials.remove(purchaseMaterial);
        purchaseMaterial.setMaterial(null);
    }

    public void addPurchase(Purchase purchase, BigDecimal quantity, BigDecimal costPerUnit){
        purchase.addMaterial(this, quantity, costPerUnit);
    }

    public void removePurchase(Purchase purchase){
        purchase.removeMaterial(this);
    }

    public void addProductMaterial(ProductMaterial productMaterial){
        if(productMaterials == null) productMaterials = new HashSet<>();
        productMaterials.add(productMaterial);
        productMaterial.setMaterial(this);
    }

    public void removeProductMaterial(ProductMaterial productMaterial){
        if(productMaterials == null) return;
        productMaterials.remove(productMaterial);
        productMaterial.setMaterial(null);
    }

    public void addProduct(Product product, BigDecimal quantity){
        product.addMaterial(this, quantity);
    }

    public void removeProduct(Product product){
        product.removeMaterial(this);
    }
}
