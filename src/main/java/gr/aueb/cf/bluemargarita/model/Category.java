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
@Table(name = "categories")
public class Category extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ColumnDefault("true")
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY )
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<Product> products = new HashSet<>();

    public Set<Product> getAllProducts() {
        if(products == null) {
            products = new HashSet<>();
        } return Collections.unmodifiableSet(products);
    }

    public void addProduct(Product product) {
        if(products == null) products = new HashSet<>();
        products.add(product);
        product.setCategory(this);
    }

    public void removeProduct(Product product){
        if(products == null) return;
        products.remove(product);
        product.setCategory(null);
    }
}
