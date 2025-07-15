package gr.aueb.cf.bluemargarita.dto.purchase;

import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import org.springframework.data.domain.Page;

public class PaginatedFilteredPurchasesWithSummary extends Paginated<PurchaseReadOnlyDTO> {

    PurchaseSummaryDTO summary;

    public PaginatedFilteredPurchasesWithSummary(Page<PurchaseReadOnlyDTO> page, PurchaseSummaryDTO summary){
        super(page);
        this.summary = summary;
    }
}
