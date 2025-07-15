package gr.aueb.cf.bluemargarita.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "purchases")
public class Purchase extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @OneToOne(mappedBy = "purchase", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private Expense relatedExpense;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<PurchaseMaterial> purchaseMaterials = new HashSet<>();

    public Set<PurchaseMaterial> getAllPurchaseMaterials() {
        if(purchaseMaterials == null) purchaseMaterials = new HashSet<>();
        return Collections.unmodifiableSet(purchaseMaterials);
    }

    public void addPurchaseMaterial(PurchaseMaterial purchaseMaterial){
        if(purchaseMaterials == null) purchaseMaterials = new HashSet<>();
        purchaseMaterials.add(purchaseMaterial);
        purchaseMaterial.setPurchase(this);
    }

    public void removePurchaseMaterial(PurchaseMaterial purchaseMaterial){
        if(purchaseMaterials == null) return;
        purchaseMaterials.remove(purchaseMaterial);
        purchaseMaterial.setPurchase(null);
    }

    public void addSupplier(Supplier supplier){
        supplier.addPurchase(this);
    }

    public void removeSupplier(Supplier supplier){
        supplier.removePurchase(this);
    }

    public void addMaterial(Material material, BigDecimal quantity, BigDecimal pricePerUnit) {
        PurchaseMaterial purchaseMaterial = new PurchaseMaterial();
        purchaseMaterial.setQuantity(quantity);
        purchaseMaterial.setMaterialNameSnapshot(material.getName());
        purchaseMaterial.setPriceAtTheTime(pricePerUnit);  // ⭐ User-entered price, NOT material.currentUnitCost
        purchaseMaterial.setPurchase(this);
        purchaseMaterial.setMaterial(material);

        // Add to both sides of the relationship
        if (purchaseMaterials == null) purchaseMaterials = new HashSet<>();
        purchaseMaterials.add(purchaseMaterial);
        material.addPurchaseMaterial(purchaseMaterial);
    }

    public void removeMaterial(Material material){

        PurchaseMaterial toRemove = purchaseMaterials.stream().
                filter(pm -> pm.getMaterial().equals(material))
                .findFirst()
                .orElse(null);

        if(toRemove != null) {
            purchaseMaterials.remove(toRemove);
            material.removePurchaseMaterial(toRemove);
        }
    }

    public void linkToExpense(Expense expense) {
        this.relatedExpense = expense;
        if (expense != null) {
            expense.setPurchase(this);
        }
    }

    public void unlinkFromExpense() {
        if (this.relatedExpense != null) {
            this.relatedExpense.setPurchase(null);
            this.relatedExpense = null;
        }
    }
}
