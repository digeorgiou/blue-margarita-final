package gr.aueb.cf.bluemargarita.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "sale_product")
public class SaleProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(precision = 8, scale = 3, nullable = false)
    private BigDecimal quantity;

    /* Keeping description and price at the time of the sale,
    for historical data of sales, in case products gets deleted or updated.
    */
    @Column(name = "product_description_snapshot")
    private String productDescriptionSnapshot;

    @Column(name = "price_at_the_time", precision = 10, scale = 2)
    private BigDecimal priceAtTheTime;

    @Column(name = "wholesale_price_at_the_time", precision = 10, scale = 2)
    private BigDecimal wholesalePriceAtTheTime;

}
