package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for sale creation response
 */
public record SaleDetailedViewDTO(
        Long saleId,
        LocalDate saleDate,
        CustomerInfoDTO customer,  // nullable for walk-in
        LocationInfoDTO location,
        PaymentMethod paymentMethod,

        BigDecimal subtotal,
        BigDecimal packagingCost,
        BigDecimal suggestedTotal,
        BigDecimal finalTotal,
        BigDecimal discountAmount,
        BigDecimal discountPercentage,

        List<SaleItemDetailsDTO> items,
        boolean isWholesale,

        int totalItemCount,
        BigDecimal averageItemPrice
) {}