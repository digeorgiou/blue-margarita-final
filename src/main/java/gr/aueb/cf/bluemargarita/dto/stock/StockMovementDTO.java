package gr.aueb.cf.bluemargarita.dto.stock;

import java.time.LocalDateTime;

public record StockMovementDTO(
        Long productId,
        String productCode,
        String productName,
        LocalDateTime movementDate,
        String movementType,           // "MANUAL_UPDATE", "SALE_RECORDED", "SALE_DELETED"
        String operationType,          // "ADD", "REMOVE", "SET", "ADJUST"
        Integer previousStock,
        Integer newStock,
        Integer changeAmount
) {}
