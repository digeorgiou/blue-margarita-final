package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerReadOnlyDTO(
        Long customerId,
        String firstname,
        String lastname,
        String fullName,
        GenderType gender,
        String phoneNumber,
        String address,
        String email,
        String tin,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt,
        LocalDate firstSaleDate
)
{}
