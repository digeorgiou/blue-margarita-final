package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

public record LocationSalesDataDTO(
        Long locationId,
        String locationName,
        BigDecimal quantitySold,
        BigDecimal revenue,
        Integer numberOfSales,
        BigDecimal averagePrice
) {}
