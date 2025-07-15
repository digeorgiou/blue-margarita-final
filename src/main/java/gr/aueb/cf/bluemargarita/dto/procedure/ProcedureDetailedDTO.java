package gr.aueb.cf.bluemargarita.dto.procedure;

import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProcedureDetailedDTO(
        // Basic procedure information
        Long procedureId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt,

        // Essential analytics
        Integer totalProductsUsing,
        BigDecimal averageProcedureCost,
        BigDecimal minProcedureCost,
        BigDecimal maxProcedureCost,
        BigDecimal averageProductSellingPriceRetail,
        List<CategoryUsageDTO> categoryDistribution
) {}
