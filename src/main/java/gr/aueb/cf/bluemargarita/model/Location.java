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
@Table(name = "locations")
public class Location extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ColumnDefault("true")
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive= true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "location", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<Sale> sales = new HashSet<>();

    public Set<Sale> getAllSales() {
        if (sales == null) sales = new HashSet<>();
        return Collections.unmodifiableSet(sales);
    }

    public void addSale(Sale sale){
        if(sales == null) sales = new HashSet<>();
        sales.add(sale);
        sale.setLocation(this);
    }

    public void removeSale(Sale sale){
        if(sales == null) return;
        sales.remove(sale);
        sale.setLocation(null);
    }

}
