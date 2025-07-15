package gr.aueb.cf.bluemargarita.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerSalesDataDTO(
        int numberOfSales,
        BigDecimal totalRevenue,
        LocalDate lastOrderDate,
        BigDecimal averageOrderValue
)
{}
