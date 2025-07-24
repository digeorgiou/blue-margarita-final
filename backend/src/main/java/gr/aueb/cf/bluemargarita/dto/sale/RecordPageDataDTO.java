package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.dto.category.CategoryForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;

import java.util.List;

public record RecordPageDataDTO(
        List<PaymentMethodDTO> paymentMethods,
        List<LocationForDropdownDTO> locations,
        List<CategoryForDropdownDTO> categories
) {
}
