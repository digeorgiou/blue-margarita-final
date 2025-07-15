package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.WeeklySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;
import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.SaleProductRepository;
import gr.aueb.cf.bluemargarita.repository.SaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductSalesAnalyticsService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProductSalesAnalyticsService.class);
    private final SaleProductRepository saleProductRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    @Autowired
    public ProductSalesAnalyticsService(SaleProductRepository saleProductRepository,
                                        ProductRepository productRepository,
                                        SaleRepository saleRepository) {
        this.saleProductRepository = saleProductRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    public ProductSalesAnalyticsDTO getProductSalesAnalytics(Long productId,
                                                             LocalDate startDate,
                                                             LocalDate endDate)
            throws EntityNotFoundException {

        LOGGER.debug("Retrieving optimized product sales analytics for product {} from {} to {}",
                productId, startDate, endDate);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product", "Product with id " + productId + " not found"));

        // ✅ OPTIMIZED: Use single repository query instead of loading all SaleProduct entities
        Object[] metrics = saleProductRepository.calculateProductMetricsByDateRange(productId, startDate, endDate);

        if (metrics == null || ((Number) metrics[0]).intValue() == 0) {
            // No sales in this period - return empty analytics
            return createEmptyAnalytics(product, startDate, endDate);
        }

        Integer salesCount = ((Number) metrics[0]).intValue();
        Integer totalQuantity = ((Number) metrics[1]).intValue();
        BigDecimal totalRevenue = (BigDecimal) metrics[2];

        // Calculate derived metrics
        BigDecimal avgQuantityPerSale = salesCount > 0 ?
                BigDecimal.valueOf(totalQuantity).divide(BigDecimal.valueOf(salesCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        BigDecimal avgRevenuePerSale = salesCount > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(salesCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        BigDecimal avgSellingPrice = totalQuantity > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        // Get time-series data using optimized queries
        List<WeeklySalesDataDTO> weeklyData = getWeeklySalesData(productId, startDate, endDate);
        List<MonthlySalesDataDTO> monthlyData = getMonthlySalesData(productId, startDate, endDate);
        List<YearlySalesDataDTO> yearlyData = getYearlySalesData(productId, startDate, endDate);

        // Get top locations and customers using optimized queries
        List<LocationSalesDataDTO> topLocations = getTopLocationsByProductSales(productId, startDate, endDate, 5);
        List<CustomerSalesDataDTO> topCustomers = getTopCustomersByProductPurchases(productId, startDate, endDate, 5);

        // Get last sale date using repository query
        LocalDate lastSaleDate = productRepository.findLastSaleDateByProductId(productId);

        LOGGER.debug("Optimized analytics completed: salesCount={}, totalQuantity={}, totalRevenue={}",
                salesCount, totalQuantity, totalRevenue);

        return new ProductSalesAnalyticsDTO(
                productId,
                product.getName(),
                product.getCode(),
                startDate,
                endDate,
                BigDecimal.valueOf(totalQuantity),
                totalRevenue,
                salesCount,
                avgQuantityPerSale,
                avgRevenuePerSale,
                avgSellingPrice,
                weeklyData,
                monthlyData,
                yearlyData,
                topLocations,
                topCustomers,
                lastSaleDate,
                BigDecimal.valueOf(product.getStock()),
                product.getIsActive()
        );
    }

    private ProductSalesAnalyticsDTO createEmptyAnalytics(Product product, LocalDate startDate, LocalDate endDate) {
        return new ProductSalesAnalyticsDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                startDate,
                endDate,
                BigDecimal.ZERO, // totalQuantity
                BigDecimal.ZERO, // totalRevenue
                0, // numberOfSales
                BigDecimal.ZERO, // avgQuantityPerSale
                BigDecimal.ZERO, // avgRevenuePerSale
                BigDecimal.ZERO, // avgSellingPrice
                Collections.emptyList(), // weeklyData
                Collections.emptyList(), // monthlyData
                Collections.emptyList(), // yearlyData
                Collections.emptyList(), // topLocations
                Collections.emptyList(), // topCustomers
                null, // lastSaleDate
                BigDecimal.valueOf(product.getStock()),
                product.getIsActive()
        );
    }

    public List<WeeklySalesDataDTO> getWeeklySalesData(Long productId, LocalDate startDate, LocalDate endDate) {
        LOGGER.debug("Retrieving optimized weekly sales data for product {}", productId);

        // ✅ OPTIMIZED: Use repository aggregation with GROUP BY
        List<Object[]> weeklyResults = saleProductRepository.calculateWeeklySalesByProductId(productId, startDate, endDate);

        return weeklyResults.stream()
                .map(data -> {
                    int year = ((Number) data[0]).intValue();
                    int week = ((Number) data[1]).intValue();
                    Integer totalQuantity = ((Number) data[2]).intValue();
                    BigDecimal totalRevenue = (BigDecimal) data[3];

                    // Calculate week start and end dates
                    LocalDate weekStartDate = getWeekStartDate(year, week);
                    LocalDate weekEndDate = weekStartDate.plusDays(6);

                    // Calculate average price
                    BigDecimal averagePrice = totalQuantity > 0 ?
                            totalRevenue.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    // ✅ FIXED: Correct WeeklySalesDataDTO constructor
                    return new WeeklySalesDataDTO(
                            year,               // year
                            week,               // weekOfYear
                            weekStartDate,      // weekStartDate
                            weekEndDate,        // weekEndDate
                            totalQuantity,      // quantitySold
                            totalRevenue,       // revenue
                            0,                  // numberOfSales (can add to query if needed)
                            averagePrice        // averagePrice
                    );
                })
                .sorted(Comparator.comparing(WeeklySalesDataDTO::year).thenComparing(WeeklySalesDataDTO::weekOfYear))
                .collect(Collectors.toList());
    }

    public List<MonthlySalesDataDTO> getMonthlySalesData(Long productId, LocalDate startDate, LocalDate endDate) {
        LOGGER.debug("Retrieving optimized monthly sales data for product {}", productId);

        // ✅ OPTIMIZED: Use repository aggregation with GROUP BY
        List<Object[]> monthlyResults = saleProductRepository.calculateMonthlySalesByProductId(productId, startDate, endDate);

        return monthlyResults.stream()
                .map(data -> {
                    int year = ((Number) data[0]).intValue();
                    int month = ((Number) data[1]).intValue();
                    BigDecimal totalQuantity = BigDecimal.valueOf(((Number) data[2]).intValue());
                    BigDecimal totalRevenue = (BigDecimal) data[3];

                    // Format as "YYYY-MM"
                    String monthYear = String.format("%d-%02d", year, month);

                    // Calculate average price
                    BigDecimal averagePrice = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                            totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    // ✅ FIXED: Correct MonthlySalesDataDTO constructor
                    return new MonthlySalesDataDTO(
                            monthYear,          // monthYear (String format "2024-01")
                            totalQuantity,      // quantitySold (BigDecimal)
                            totalRevenue,       // revenue
                            0,                  // numberOfSales (can add to query if needed)
                            averagePrice        // averagePrice
                    );
                })
                .sorted(Comparator.comparing(MonthlySalesDataDTO::monthYear))
                .collect(Collectors.toList());
    }

    public List<YearlySalesDataDTO> getYearlySalesData(Long productId, LocalDate startDate, LocalDate endDate) {
        LOGGER.debug("Retrieving optimized yearly sales data for product {}", productId);

        // ✅ OPTIMIZED: Use repository aggregation with GROUP BY
        List<Object[]> yearlyResults = saleProductRepository.calculateYearlySalesByProductId(productId, startDate, endDate);

        return yearlyResults.stream()
                .map(data -> {
                    int year = ((Number) data[0]).intValue();
                    Integer totalQuantity = ((Number) data[1]).intValue();
                    BigDecimal totalRevenue = (BigDecimal) data[2];

                    // Calculate average price
                    BigDecimal averagePrice = totalQuantity > 0 ?
                            totalRevenue.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    // ✅ FIXED: Correct YearlySalesDataDTO constructor (correct parameter order)
                    return new YearlySalesDataDTO(
                            year,               // year
                            totalQuantity,      // quantitySold (Integer)
                            totalRevenue,       // revenue
                            0,                  // numberOfSales (can add to query if needed)
                            averagePrice        // averagePrice
                    );
                })
                .sorted(Comparator.comparing(YearlySalesDataDTO::year))
                .collect(Collectors.toList());
    }

    public List<CustomerSalesDataDTO> getTopCustomersByProductPurchases(Long productId,
                                                                        LocalDate startDate,
                                                                        LocalDate endDate,
                                                                        int limit) {
        LOGGER.debug("Retrieving optimized top customers for product {}", productId);

        // ✅ OPTIMIZED: Use repository aggregation
        List<Object[]> customerResults = saleProductRepository.findTopCustomersByProductId(productId, startDate, endDate);

        return customerResults.stream()
                .limit(limit)
                .map(data -> {
                    Long customerId = ((Number) data[0]).longValue();
                    String firstName = (String) data[1];
                    String lastName = (String) data[2];
                    Integer totalQuantity = ((Number) data[3]).intValue();
                    BigDecimal totalRevenue = (BigDecimal) data[4];
                    LocalDate lastSaleDate = (LocalDate) data[5];

                    // ✅ FIXED: Correct CustomerSalesDataDTO constructor
                    return new CustomerSalesDataDTO(
                            customerId,                                     // customerId (Long)
                            firstName + " " + lastName,                     // customerName (String with space)
                            "",                                             // customerEmail (empty for now)
                            totalQuantity,                                  // quantityPurchased (Integer)
                            totalRevenue,                                   // totalRevenue (BigDecimal)
                            0,                                              // numberOfSales (can add to query if needed)
                            lastSaleDate                                    // lastOrderDate (LocalDate)
                    );
                })
                .collect(Collectors.toList());
    }

    public List<LocationSalesDataDTO> getTopLocationsByProductSales(Long productId,
                                                                    LocalDate startDate,
                                                                    LocalDate endDate,
                                                                    int limit) {
        LOGGER.debug("Retrieving optimized top locations for product {}", productId);

        // ✅ OPTIMIZED: Use repository aggregation with GROUP BY and LIMIT
        List<Object[]> locationResults = saleProductRepository.findTopLocationsByProductId(productId, startDate, endDate, limit);

        return locationResults.stream()
                .map(data -> {
                    Long locationId = ((Number) data[0]).longValue();
                    String locationName = (String) data[1];
                    BigDecimal totalQuantity = BigDecimal.valueOf(((Number) data[2]).intValue());
                    BigDecimal totalRevenue = (BigDecimal) data[3];
                    Integer numberOfSales = ((Number) data[4]).intValue();

                    // Calculate average price
                    BigDecimal averagePrice = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                            totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    // ✅ FIXED: Correct LocationSalesDataDTO constructor
                    return new LocationSalesDataDTO(
                            locationId,         // locationId (Long)
                            locationName,       // locationName (String)
                            totalQuantity,      // quantitySold (BigDecimal)
                            totalRevenue,       // revenue (BigDecimal)
                            numberOfSales,      // numberOfSales (Integer)
                            averagePrice        // averagePrice (BigDecimal)
                    );
                })
                .collect(Collectors.toList());
    }

    public List<ProductStatsSummaryDTO> getTopProductsByRevenue(LocalDate startDate,
                                                                LocalDate endDate,
                                                                int limit) {
        LOGGER.debug("Retrieving optimized top products by revenue from {} to {}", startDate, endDate);

        // ✅ OPTIMIZED: Use repository aggregation instead of loading all SaleProduct entities
        List<Object[]> topProducts = saleRepository.findTopSellingProductsByDateRange(startDate, endDate);

        return topProducts.stream()
                .limit(limit)
                .map(data -> {
                    Long productId = ((Number) data[0]).longValue();
                    String productName = (String) data[1];
                    String productCode = (String) data[2];
                    BigDecimal totalQuantity = BigDecimal.valueOf(((Number) data[3]).intValue());
                    BigDecimal totalRevenue = (BigDecimal) data[4];

                    // ✅ FIXED: Correct ProductStatsSummaryDTO constructor
                    return new ProductStatsSummaryDTO(
                            productId,          // productId (Long)
                            productName,        // productName (String)
                            productCode,        // code (String)
                            totalQuantity,      // totalItemsSold (BigDecimal)
                            totalRevenue,       // totalRevenue (BigDecimal)
                            null                // lastSaleDate (can add to query if needed)
                    );
                })
                .collect(Collectors.toList());
    }

    // Helper method to calculate week start date from year and week number
    private LocalDate getWeekStartDate(int year, int weekOfYear) {
        WeekFields weekFields = WeekFields.of(DayOfWeek.MONDAY, 1);
        return LocalDate.of(year, 1, 1)
                .with(weekFields.weekOfYear(), weekOfYear)
                .with(weekFields.dayOfWeek(), 1);
    }
}
