package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;

public record PurchaseMaterialRequestDTO(
        Long materialId,
        BigDecimal quantity,
        BigDecimal pricePerUnit
){};
