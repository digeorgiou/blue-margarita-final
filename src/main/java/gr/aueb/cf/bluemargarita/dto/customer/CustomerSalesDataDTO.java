package gr.aueb.cf.bluemargarita.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerSalesDataDTO(
        Long customerId,
        String customerName,
        String customerEmail,
        Integer quantityPurchased,
        BigDecimal totalRevenue,
        Integer numberOfSales,
        LocalDate lastOrderDate
)
{}
