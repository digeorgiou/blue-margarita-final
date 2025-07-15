package gr.aueb.cf.bluemargarita.dto.stock;

/**
 * DTO for stock update results
 */
public record StockUpdateResultDTO(
        Long productId,
        String productCode,
        Integer previousStock,
        Integer newStock,
        Integer changeAmount,
        boolean success,
        String errorMessage     // If update failed
) {
}
