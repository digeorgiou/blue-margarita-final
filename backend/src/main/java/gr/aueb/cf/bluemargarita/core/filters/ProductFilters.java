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
    private String productName;

    @Nullable
    private String productCode;

    @Nullable
    private String nameOrCode;

    @Nullable
    private Long categoryId;

    @Nullable
    private Long procedureId;

    @Nullable
    private String materialName;

    @Nullable
    private Long materialId;

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

    @Nullable
    private Boolean negativeStock;
}
