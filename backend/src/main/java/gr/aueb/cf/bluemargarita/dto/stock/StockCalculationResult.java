package gr.aueb.cf.bluemargarita.dto.stock;

public record StockCalculationResult(
        Integer previousStock,
        Integer newStock,
        Integer changeAmount
) {}
