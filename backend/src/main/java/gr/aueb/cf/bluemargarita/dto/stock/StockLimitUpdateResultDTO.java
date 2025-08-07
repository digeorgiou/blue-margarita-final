package gr.aueb.cf.bluemargarita.dto.stock;

import java.time.LocalDateTime;

public record StockLimitUpdateResultDTO(
        Long productId,
        String productCode,
        Integer previousStockLimit,
        Integer newStockLimit,
        Integer changeAmount,
        boolean success,

        LocalDateTime updatedAt
) {
}
