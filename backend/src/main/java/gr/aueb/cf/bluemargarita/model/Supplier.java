package gr.aueb.cf.bluemargarita.model;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.*;

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
@Table(name = "suppliers")
public class Supplier extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "tin", unique = true) // Taxpayer Identification Number
    private String tin;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String email;

    @ColumnDefault("true")
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive= true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "supplier", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<Purchase> purchases = new HashSet<>();

    public Set<Purchase> getAllPurchases() {
        if(purchases == null) purchases = new HashSet<>();
        return Collections.unmodifiableSet(purchases);
    }

    //Helper Methods

    public void addPurchase(Purchase purchase){
        if(purchases == null) purchases = new HashSet<>();
        purchases.add(purchase);
        purchase.setSupplier(this);
    }

    public void removePurchase(Purchase purchase){
        if(purchases == null) return;
        purchases.remove(purchase);
        purchase.setSupplier(null);
    }
}
