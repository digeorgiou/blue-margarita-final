package gr.aueb.cf.bluemargarita.dto.supplier;

public record SupplierSearchResultDTO(
        Long supplierId,
        String supplierName,
        String supplierTin,
        String email,
        String phoneNumber
) {
}
