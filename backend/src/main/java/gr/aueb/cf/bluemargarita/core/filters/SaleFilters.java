package gr.aueb.cf.bluemargarita.core.filters;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import lombok.*;
import org.springframework.lang.Nullable;


import java.time.LocalDate;

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
    private Long productId;

    @Nullable
    private Long locationId;

    @Nullable
    private Long categoryId;

    @Nullable
    private LocalDate saleDateFrom;

    @Nullable
    private LocalDate saleDateTo;

    @Nullable
    private PaymentMethod paymentMethod;
}
