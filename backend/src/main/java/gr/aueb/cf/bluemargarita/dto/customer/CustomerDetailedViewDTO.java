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

        // All-time statistics
        BigDecimal totalRevenue,
        Integer totalSalesCount,
        BigDecimal averageOrderValue,
        LocalDate lastOrderDate,

        // Recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,

        // Yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue,

        // Top products by revenue for Customer
        List<ProductStatsSummaryDTO> topProducts

) {}
