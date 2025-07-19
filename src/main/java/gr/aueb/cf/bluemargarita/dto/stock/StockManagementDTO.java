package gr.aueb.cf.bluemargarita.dto.stock;

import java.math.BigDecimal;

/**
 * Lightweight DTO for stock management operations
 * Contains only essential information needed for stock updates
 */
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

        String status           // NORMAL, LOW, NEGATIVE, NO_ALERT
) {

    /**
     * Stock status enumeration for easy filtering and display
     */
    public enum StockStatus {
        NORMAL,     // Stock > lowStockAlert
        LOW,        // Stock <= lowStockAlert but > 0
        NEGATIVE,   // Stock < 0
        NO_ALERT    // lowStockAlert not set
    }
}