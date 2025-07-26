package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;

public record ExpenseTypeDTO(
        ExpenseType value,
        String displayName
) {
}
