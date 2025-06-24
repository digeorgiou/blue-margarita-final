package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerWithSalesDTO(
        Long customerId,
        String firstname,
        String lastname,
        String fullName,
        GenderType gender,
        String phoneNumber,
        String address,
        String email,
        String tin,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,

        // Sales statistics
        int totalOrders,
        BigDecimal totalOrderValue,
        LocalDate lastOrderDate,
        BigDecimal averageOrderValue
) {}
