package gr.aueb.cf.bluemargarita.dto.product;

import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.WeeklySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;

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
        List<WeeklySalesDataDTO> weeklySalesData,
        List<MonthlySalesDataDTO> monthlySalesData,
        List<YearlySalesDataDTO> yearlySalesData,

        // Top locations and customers for this product
        List<LocationSalesDataDTO> topLocationsByRevenue,
        List<CustomerSalesDataDTO> topCustomersByQuantity,

        // Additional insights
        LocalDate lastSaleDate,
        BigDecimal currentStock,
        boolean isActive
) {}
