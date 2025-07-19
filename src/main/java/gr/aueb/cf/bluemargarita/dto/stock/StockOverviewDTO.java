package gr.aueb.cf.bluemargarita.dto.stock;

import java.math.BigDecimal;

/**
 * DTO providing a comprehensive overview of stock status across all products
 * Used in stock management dashboard for quick health assessment
 */
public record StockOverviewDTO(
        Integer totalActiveProducts,
        Integer lowStockProductCount,
        Integer negativeStockProductCount,
        BigDecimal totalInventoryValue,    // Total value of all inventory at current prices
        Double stockHealthPercentage       // Percentage of products with healthy stock levels
) {
    /**
     * Gets the number of products with stock issues (low + negative)
     */
    public Integer getProblematicStockCount() {
        return lowStockProductCount + negativeStockProductCount;
    }

    /**
     * Gets the percentage of products with stock issues
     */
    public Double getProblematicStockPercentage() {
        if (totalActiveProducts == 0) return 0.0;
        return (getProblematicStockCount() * 100.0) / totalActiveProducts;
    }

    /**
     * Determines overall stock health status for dashboard color coding
     */
    public String getOverallStockHealth() {
        if (stockHealthPercentage >= 90) return "EXCELLENT";
        if (stockHealthPercentage >= 75) return "GOOD";
        if (stockHealthPercentage >= 60) return "FAIR";
        if (stockHealthPercentage >= 40) return "POOR";
        return "CRITICAL";
    }
}
