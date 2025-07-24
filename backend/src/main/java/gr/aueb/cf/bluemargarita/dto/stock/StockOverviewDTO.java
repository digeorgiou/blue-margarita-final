package gr.aueb.cf.bluemargarita.dto.stock;

import java.math.BigDecimal;

/**
 * DTO providing a comprehensive overview of stock status across all products
 * Used in stock management dashboard for quick health assessment
 */
public record StockOverviewDTO(
        Integer totalActiveProducts,
        Integer lowStockProductCount,
        BigDecimal totalInventoryValue,    // Total value of all inventory at current prices
        Double stockHealthPercentage       // Percentage of products with healthy stock levels
) {
}
