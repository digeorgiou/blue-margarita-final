package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

public record ProductMaterialDetailDTO(
        Long materialId,
        String materialName,
        BigDecimal quantity,
        String unitOfMeasure,
        BigDecimal unitCost,
        BigDecimal totalCost
) {}
