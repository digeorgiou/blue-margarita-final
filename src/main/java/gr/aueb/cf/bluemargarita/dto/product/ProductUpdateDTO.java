package gr.aueb.cf.bluemargarita.dto.product;
import jakarta.validation.constraints.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.util.Map;

public record ProductUpdateDTO(
        @NotNull(message = "Product ID is required")
        Long productId,

        @NotBlank(message = "Product description is required")
        @Size(max = 255, message = "Description cannot exceed 255 characters")
        String name,

        @NotBlank(message = "Product code is required")
        @Size(max = 50, message = "Code cannot exceed 50 characters")
        String code,

        @NotNull(message = "Category is required")
        Long categoryId,

        @Nullable
        @DecimalMin(value = "0.0", inclusive = false, message = "Final selling price must be positive")
        BigDecimal finalSellingPriceRetail,

        @Nullable
        @DecimalMin(value = "0.0", inclusive = false, message = "Final selling price must be positive")
        BigDecimal finalSellingPriceWholesale,

        @Nullable
        @Min(value = 0, message = "Minutes to make cannot be negative")
        Integer minutesToMake,

        @Nullable
        @Min(value = 0, message = "Stock cannot be negative")
        Integer stock,

        @Nullable
        @Min(value = 0, message = "Low stock alert cannot be negative")
        Integer lowStockAlert,

        @NotNull(message = "Updater user ID is required")
        Long updaterUserId,

        // Map of MaterialId -> Quantity (null means don't update materials)
        @Nullable
        Map<Long, BigDecimal> materials,

        // Map of ProcedureId -> Cost (null means don't update procedures)
        @Nullable
        Map<Long, BigDecimal> procedures
) {}
