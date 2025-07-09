package gr.aueb.cf.bluemargarita.dto.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.util.Map;

// ProductInsertDTO - for creating new products
public record ProductInsertDTO(
        @NotBlank(message = "Product description is required")
        @Size(max = 255, message = "Name cannot exceed 255 characters")
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

        @NotNull(message = "Creator user ID is required")
        Long creatorUserId,

        // Map of MaterialId -> Quantity
        @Nullable
        @Valid
        Map<@NotNull Long, @DecimalMin("0.001") BigDecimal> materials,

        // Map of ProcedureId -> Cost
        @Nullable
        @Valid
        Map<@NotNull Long, @DecimalMin("0.001") BigDecimal> procedures
) {}
