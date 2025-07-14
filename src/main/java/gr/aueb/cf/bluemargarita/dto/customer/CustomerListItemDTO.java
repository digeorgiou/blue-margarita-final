package gr.aueb.cf.bluemargarita.dto.customer;

public record CustomerListItemDTO(
        Long customerId,
        String firstname,
        String lastname,
        String phoneNumber,
        String address,
        String email,
        String tin
) {}
