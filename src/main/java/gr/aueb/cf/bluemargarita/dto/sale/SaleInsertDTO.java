package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record SaleInsertDTO(

        @Nullable
        Long customerId, // Can be null for walk-in customers
        @NotNull(message = "Παρακαλώ εισάγετε τοποθεσία")
        Long locationId,
        LocalDate saleDate,
        BigDecimal finalTotalPrice, // User-defined final price
        BigDecimal packagingPrice,
        PaymentMethod paymentMethod,
        Map<Long, BigDecimal> products, // ProductId -> Quantity
        Long creatorUserId
) {}