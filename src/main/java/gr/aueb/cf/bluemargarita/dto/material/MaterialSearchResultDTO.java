package gr.aueb.cf.bluemargarita.dto.material;

import java.math.BigDecimal;

public record MaterialSearchResultDTO(
        Long materialId,
        String materialName,
        String unitOfMeasure,
        BigDecimal currentUnitCost
) {
}