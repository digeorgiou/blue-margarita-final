package gr.aueb.cf.bluemargarita.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerSalesDataDTO(
        BigDecimal totalRevenue,
        int numberOfSales,
        LocalDate lastOrderDate,
        BigDecimal averageOrderValue
)
{}
