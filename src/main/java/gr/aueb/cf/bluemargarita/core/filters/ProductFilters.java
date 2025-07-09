package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ProductFilters extends GenericFilters {

    @Nullable
    private String name;

    @Nullable
    private String code;

    @Nullable
    private String categoryName;

    @Nullable
    private Long categoryId;

    @Nullable
    private BigDecimal minPrice;

    @Nullable
    private BigDecimal maxPrice;

    @Nullable
    private Integer minStock;

    @Nullable
    private Integer maxStock;

    @Nullable
    private Boolean isActive;

    @Nullable
    private Boolean lowStock; // Products below lowStockAlert threshold
}
