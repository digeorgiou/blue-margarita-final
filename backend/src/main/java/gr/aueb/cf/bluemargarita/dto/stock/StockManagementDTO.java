package gr.aueb.cf.bluemargarita.dto.stock;
import gr.aueb.cf.bluemargarita.core.enums.StockStatus;

import java.math.BigDecimal;

public record StockManagementDTO(
        Long productId,
        String productName,
        String productCode,
        String categoryName,
        Integer currentStock,
        Integer lowStockAlert,
        Boolean isActive,

        BigDecimal unitSellingPrice,
        BigDecimal totalStockValue,

        StockStatus status
) {}