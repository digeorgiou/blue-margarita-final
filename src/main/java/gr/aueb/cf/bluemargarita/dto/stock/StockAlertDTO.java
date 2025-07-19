package gr.aueb.cf.bluemargarita.dto.stock;

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
        String stockStatus        // "LOW", "NEGATIVE", "NORMAL", "NO_TRACKING"
) {
    /**
     * Determines alert severity level for UI styling
     */
    public String getAlertSeverity() {
        return switch (stockStatus) {
            case "NEGATIVE" -> "CRITICAL";
            case "LOW" -> "WARNING";
            case "NORMAL" -> "INFO";
            default -> "UNKNOWN";
        };
    }
}
