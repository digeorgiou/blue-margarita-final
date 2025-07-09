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
public class ExpenseFilters extends GenericFilters {

    @Nullable
    private String description;

    @Nullable
    private LocalDate expenseDateFrom;

    @Nullable
    private LocalDate expenseDateTo;

    @Nullable
    private BigDecimal minAmount;

    @Nullable
    private BigDecimal maxAmount;

    @Nullable
    private String expenseType;

    @Nullable
    private Boolean isPurchase; // Expenses linked to purchases
}
