package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CustomerDetailedViewDTO(
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
        LocalDate firstSaleDate,

        //Stats for customer
        BigDecimal totalRevenue,
        int numberOfSales,
        LocalDate lastOrderDate,
        BigDecimal averageOrderValue,


        //Top products by revenue for Customer
        List<ProductStatsSummaryDTO> topProducts

) {}
