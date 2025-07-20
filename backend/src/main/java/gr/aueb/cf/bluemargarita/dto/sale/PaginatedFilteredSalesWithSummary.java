package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import org.springframework.data.domain.Page;

public class PaginatedFilteredSalesWithSummary extends Paginated<SaleReadOnlyDTO> {

    SalesSummaryDTO summary;

    public PaginatedFilteredSalesWithSummary(Page<SaleReadOnlyDTO> page, SalesSummaryDTO summary) {
        super(page);
        this.summary = summary;
    }
}
