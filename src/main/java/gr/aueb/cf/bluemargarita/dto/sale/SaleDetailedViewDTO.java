package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for sale creation response
 */
public record SaleDetailedViewDTO(
        Long saleId,
        LocalDate saleDate,
        CustomerSearchResultDTO customer,  // nullable for walk-in
        LocationForDropdownDTO location,
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