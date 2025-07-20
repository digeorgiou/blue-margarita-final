package gr.aueb.cf.bluemargarita.dto.product;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO containing the results of a bulk price recalculation operation
 */
public record PriceRecalculationResultDTO(
        int totalProductsProcessed,
        int productsUpdated,
        int productsSkipped,
        int productsFailed,
        LocalDateTime processedAt,
        String processedByUsername,
        List<String> failedProductCodes
) {

    /**
     * Calculates success rate as percentage
     */
    public double getSuccessRate() {
        if (totalProductsProcessed == 0) return 0.0;
        return (double) productsUpdated / totalProductsProcessed * 100;
    }

    /**
     * Checks if the operation was completely successful
     */
    public boolean isCompletelySuccessful() {
        return productsFailed == 0 && totalProductsProcessed > 0;
    }
}
