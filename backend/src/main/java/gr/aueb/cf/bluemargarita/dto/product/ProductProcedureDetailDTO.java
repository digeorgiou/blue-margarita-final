package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

public record ProductProcedureDetailDTO(
        Long procedureId,
        String procedureName,
        BigDecimal cost
) {}
