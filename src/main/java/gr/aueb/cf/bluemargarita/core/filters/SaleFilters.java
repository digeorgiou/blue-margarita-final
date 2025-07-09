package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;

// SaleFilters for when you implement Sale filtering
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class SaleFilters extends GenericFilters {

    @Nullable
    private Long customerId;

    @Nullable
    private String customerName;

    @Nullable
    private Long locationId;

    @Nullable
    private String locationName;

    @Nullable
    private LocalDate saleDateFrom;

    @Nullable
    private LocalDate saleDateTo;

    @Nullable
    private BigDecimal minAmount;

    @Nullable
    private BigDecimal maxAmount;

    @Nullable
    private String paymentMethod;
}
