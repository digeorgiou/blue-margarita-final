package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class PurchaseFilters extends GenericFilters {

    @Nullable
    private Long supplierId;

    @Nullable
    private String supplierName;

    @Nullable
    private LocalDate purchaseDateFrom;

    @Nullable
    private LocalDate purchaseDateTo;

    @Nullable
    private BigDecimal minCost;

    @Nullable
    private BigDecimal maxCost;

    @Nullable
    private String materialDescription;
}
