package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SaleReadOnlyDTO(
        Long id,
        String customerName,
        String locationName,
        LocalDate saleDate,
        BigDecimal suggestedTotalPrice,
        BigDecimal finalTotalPrice,
        BigDecimal discountPercentage,
        BigDecimal discountAmount,
        BigDecimal packagingPrice,
        BigDecimal grandTotal, // finalTotalPrice + packagingPrice
        PaymentMethod paymentMethod,
        int productCount,
        List<SaleProductDTO> products,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy
) {}
