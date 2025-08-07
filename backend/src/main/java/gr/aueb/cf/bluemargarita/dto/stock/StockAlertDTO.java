package gr.aueb.cf.bluemargarita.dto.stock;

import gr.aueb.cf.bluemargarita.core.enums.StockStatus;

/**
 * DTO for stock alert information displayed in dashboard and stock monitoring
 * Used for low stock warnings and negative stock emergencies
 */
public record StockAlertDTO(
        Long productId,
        String productCode,
        String productName,
        Integer currentStock,
        Integer lowStockThreshold,
        StockStatus stockStatus        // "LOW", "NEGATIVE", "NORMAL", "NO_TRACKING"
) { }
