package gr.aueb.cf.bluemargarita.dto.stock;

import java.time.LocalDateTime;

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
        String errorMessage,     // If update failed

        String operationType,        // "ADD", "REMOVE", "SET"
        String movementReason,       // "MANUAL", "SALE", "PURCHASE", "ADJUSTMENT"
        LocalDateTime updatedAt
) {
}
