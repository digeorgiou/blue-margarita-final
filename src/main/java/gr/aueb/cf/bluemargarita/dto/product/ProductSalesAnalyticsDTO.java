package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProductSalesAnalyticsDTO(
        Long productId,
        String productName,
        String productCode,
        LocalDate periodStart,
        LocalDate periodEnd,

        // Core metrics
        BigDecimal totalQuantitySold,
        BigDecimal totalRevenue,
        Integer numberOfSales,

        // Averages
        BigDecimal averageQuantityPerSale,
        BigDecimal averageRevenuePerSale,
        BigDecimal averageSellingPrice,

        // Trends
        List<DailySalesDataDTO> dailySalesData,
        List<MonthlySalesDataDTO> monthlySalesData,

        // Top locations and customers for this product
        List<LocationSalesDataDTO> topLocationsByRevenue,
        List<CustomerSalesDataDTO> topCustomersByQuantity,

        // Additional insights
        LocalDate lastSaleDate,
        BigDecimal currentStock,
        boolean isActive
) {}
