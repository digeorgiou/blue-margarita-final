package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerSalesDataDTO(
        Long customerId,
        String customerName,
        String customerEmail,
        BigDecimal quantityPurchased,
        BigDecimal totalSpent,
        Integer numberOfPurchases,
        LocalDate lastPurchaseDate
) {}
