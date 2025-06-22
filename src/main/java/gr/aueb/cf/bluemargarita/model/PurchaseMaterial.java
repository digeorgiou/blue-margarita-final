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
@Table(name = "purchase_material")
public class PurchaseMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    @Column(precision = 8, scale = 3, nullable = false)
    private BigDecimal quantity;

    /* Keeping description and price at the time of the purchase,
    for historical data of purchases, in case materials gets deleted or updated.
    */
    @Column(name = "price_at_the_time" , precision = 10, scale = 2 )
    private BigDecimal priceAtTheTime;

    @Column(name = "material_description_snapshot")
    private String materialDescriptionSnapshot;

}
