package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.dto.sale.PaymentMethodDTO;

import java.util.List;

public record ExpensesOverviewDTO(
        List<ExpenseTypeDTO> expenseTypes,
        List<ExpenseReadOnlyDTO> recentExpenses
) {
}
