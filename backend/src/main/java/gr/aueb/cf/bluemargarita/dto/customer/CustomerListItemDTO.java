package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;

public record CustomerListItemDTO(
        Long customerId,
        String firstname,
        String lastname,
        String phoneNumber,
        String address,
        String email,
        String tin,
        GenderType gender
) {}
