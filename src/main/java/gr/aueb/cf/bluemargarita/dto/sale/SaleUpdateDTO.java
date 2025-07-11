package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaleUpdateDTO(
        Long saleId,
        Long customerId,
        Long locationId,
        LocalDate saleDate,
        BigDecimal finalTotalPrice, // User can update final price
        BigDecimal packagingPrice,
        PaymentMethod paymentMethod,
        Long updaterUserId
) {}
