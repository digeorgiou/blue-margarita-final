package gr.aueb.cf.bluemargarita.dto.stock;

import java.util.List;

/**
 * DTO for bulk stock update operations
 */
public record BulkStockUpdateDTO(
        List<StockUpdateDTO> updates,     // Reason for the batch update
        Long updaterUserId
) {
}
