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
@Table(name = "procedures")
public class Procedure extends AbstractEntity {

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

    @OneToMany(mappedBy = "procedure", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<ProductProcedure> productProcedures = new HashSet<>();

    public Set<ProductProcedure> getAllProcedureProducts() {
        if (productProcedures == null) productProcedures = new HashSet<>();
        return Collections.unmodifiableSet(productProcedures);
    }

    public void addProcedureProduct(ProductProcedure productProcedure){
        if (productProcedures == null) productProcedures = new HashSet<>();
        productProcedures.add(productProcedure);
        productProcedure.setProcedure(this);
    }

    public void removeProcedureProduct(ProductProcedure productProcedure){
        if (productProcedures == null) return;
        productProcedures.remove(productProcedure);
        productProcedure.setProcedure(null);
    }

    public void addProduct(Product product, BigDecimal cost){
        product.addProcedure(this, cost);
    }

    public void removeProduct(Product product){
        product.removeProcedure(this);
    }
}
