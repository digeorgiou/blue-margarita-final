package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;

import java.time.LocalDateTime;

public record CustomerSearchCriteria(
        String searchTerm,
        GenderType gender,
        Boolean isActive,
        LocalDateTime createdAfter,
        LocalDateTime createdBefore
) {}