package gr.aueb.cf.bluemargarita.dto.stock;

public record StockUpdateDTO(
        Long productId,
        StockUpdateType updateType,
        Integer quantity,
        String reason,           // Optional reason for the change
        Long updaterUserId
) {

    public enum StockUpdateType {
        ADD,        // Add items to stock
        REMOVE,     // Remove items from stock
        SET         // Set absolute stock value
    }
}
