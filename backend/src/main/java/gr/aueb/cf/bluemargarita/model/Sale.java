package gr.aueb.cf.bluemargarita.model;
import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
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
@Table(name = "sales")
public class Sale extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(name = "suggested_total_price", precision = 10, scale = 2)
    private BigDecimal suggestedTotalPrice;

    @Column(name = "packaging_price", precision = 10, scale = 2)
    private BigDecimal packagingPrice;

    @Column(name = "final_total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal finalTotalPrice;

    @Column(name = "discount_percentage", precision = 6, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "is_whole_sale")
    private Boolean isWholesale;

    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;


    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @Getter(AccessLevel.PRIVATE)
    private Set<SaleProduct> saleProducts = new HashSet<>();

    public Set<SaleProduct> getAllSaleProducts() {
        if(saleProducts == null) saleProducts = new HashSet<>();
        return Collections.unmodifiableSet(saleProducts);
    }

    // Helper Methods

    public void addProduct(Product product, BigDecimal quantity){
        SaleProduct saleProduct = new SaleProduct();
        saleProduct.setQuantity(quantity);
        saleProduct.setSale(this);
        saleProduct.setProductNameSnapshot(product.getName());
        saleProduct.setSuggestedPriceAtTheTime(product.getFinalSellingPriceRetail());
        saleProduct.setPriceAtTheTime(product.getFinalSellingPriceRetail());
        saleProduct.setWholesalePriceAtTheTime(product.getFinalSellingPriceWholesale());
        product.addSaleProduct(saleProduct);
        saleProducts.add(saleProduct);
    }

    public void removeProduct(Product product){
        SaleProduct toRemove = saleProducts.stream()
                .filter(sp -> sp.getProduct().equals(product))
                .findFirst()
                .orElse(null);

        if(toRemove != null){
            saleProducts.remove(toRemove);
            product.removeSaleProduct(toRemove);
        }
    }

    public void addCustomer(Customer customer){
        customer.addSale(this);
    }

    public void removeCustomer(Customer customer){
        customer.removeSale(this);
    }

    public void addLocation(Location location){
        location.addSale(this);
    }

    public void removeLocation(Location location){
        location.removeSale(this);
    }




}
