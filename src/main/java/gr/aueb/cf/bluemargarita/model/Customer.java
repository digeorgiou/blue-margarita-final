package gr.aueb.cf.bluemargarita.model;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.LocalDate;
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
@Table(name = "customers")
public class Customer extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstname;

    private String lastname;

    @Enumerated(EnumType.STRING)
    private GenderType gender;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String address;

    @Column(unique = true)
    private String email;

    @Column(name ="tin", unique = true)
    private String tin;

    @ColumnDefault("true")
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive= true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "first_sale_date")
    private LocalDate firstSaleDate;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<Sale> sales = new HashSet<>();

    public Set<Sale> getAllSales() {
        if(sales == null) sales = new HashSet<>();
        return Collections.unmodifiableSet(sales);
    }

    // Helper Methods

    public String getFullName() {
        if (firstname == null && lastname == null) return "";
        if (firstname == null) return lastname;
        if (lastname == null) return firstname;
        return firstname + " " + lastname;
    }

    public void addSale(Sale sale){
        if(sales == null) sales = new HashSet<>();
        sales.add(sale);
        sale.setCustomer(this);
    }

    public void removeSale(Sale sale){
        if(sales == null) return;
        sales.remove(sale);
        sale.setCustomer(null);
    }

}
