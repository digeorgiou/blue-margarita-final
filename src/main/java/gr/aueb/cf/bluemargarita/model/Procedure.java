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
@Table(name = "procedures")
public class Procedure extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ColumnDefault("true")
    @Column(name = "is_active")
    private Boolean isActive= true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "procedure", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<ProcedureProduct> procedureProducts = new HashSet<>();

    public Set<ProcedureProduct> getAllProcedureProducts() {
        if (procedureProducts == null) procedureProducts = new HashSet<>();
        return Collections.unmodifiableSet(procedureProducts);
    }

    public void addProcedureProduct(ProcedureProduct procedureProduct){
        if (procedureProducts == null) procedureProducts = new HashSet<>();
        procedureProducts.add(procedureProduct);
        procedureProduct.setProcedure(this);
    }

    public void removeProcedureProduct(ProcedureProduct procedureProduct){
        if (procedureProducts == null) return;
        procedureProducts.remove(procedureProduct);
        procedureProduct.setProcedure(null);
    }

    public void addProduct(Product product, BigDecimal cost){
        product.addProcedure(this, cost);
    }

    public void removeProduct(Product product){
        product.removeProcedure(this);
    }
}
