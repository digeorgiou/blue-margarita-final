package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import org.springframework.data.domain.Page;

public class PaginatedFilteredExpensesWithSummary extends Paginated<ExpenseReadOnlyDTO> {

    ExpenseSummaryDTO summary;

    public PaginatedFilteredExpensesWithSummary(Page<ExpenseReadOnlyDTO> page,
                                                ExpenseSummaryDTO summary){
        super(page);
        this.summary = summary;
    }
}
