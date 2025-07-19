package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.WeeklySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;
import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductSalesAnalyticsService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProductSalesAnalyticsService.class);
    private final SaleProductRepository saleProductRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    @Autowired
    public ProductSalesAnalyticsService(SaleProductRepository saleProductRepository,
                                        ProductRepository productRepository,
                                        LocationRepository locationRepository,
                                        CustomerRepository customerRepository,
                                        SaleRepository saleRepository) {
        this.saleProductRepository = saleProductRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
    }

    public ProductSalesAnalyticsDTO getProductSalesAnalytics(Long productId,
                                                             LocalDate startDate,
                                                             LocalDate endDate)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);

        Integer salesCount = saleProductRepository.countSalesByProductIdAndDateRange(productId, startDate, endDate);
        BigDecimal totalQuantity = saleProductRepository.sumQuantityByProductIdAndDateRange(productId, startDate, endDate);
        BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdAndDateRange(productId, startDate, endDate);
        BigDecimal avgSellingPrice = saleProductRepository.calculateAverageSellingPriceByProductIdAndDateRange(productId, startDate, endDate);

        if (salesCount == 0) {
            return createEmptyAnalytics(product, startDate, endDate);
        }

        // Calculate derived metrics
        BigDecimal avgQuantityPerSale = salesCount > 0 ?
                totalQuantity.divide(BigDecimal.valueOf(salesCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        BigDecimal avgRevenuePerSale = salesCount > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(salesCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        //last week data
        WeeklySalesDataDTO weeklyData = getWeeklySalesData(productId);
        //last month data
        MonthlySalesDataDTO monthlyData = getMonthlySalesData(productId);
        //last year data
        YearlySalesDataDTO yearlyData = getLastYearSalesData(productId);

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
                totalQuantity,
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

    private WeeklySalesDataDTO getWeeklySalesData(Long productId) {

        LocalDate today = LocalDate.now();
        LocalDate lastWeekStart = today.minusWeeks(1).with(DayOfWeek.MONDAY);
        LocalDate lastWeekEnd = lastWeekStart.plusDays(6);

        BigDecimal weeklyQuantity = saleProductRepository.sumQuantityByProductIdAndDateRange(
                productId, lastWeekStart, lastWeekEnd);
        BigDecimal weeklyRevenue = saleProductRepository.sumRevenueByProductIdAndDateRange(
                productId, lastWeekStart, lastWeekEnd);


        return new WeeklySalesDataDTO(
                lastWeekStart.getYear(),
                lastWeekStart.get(WeekFields.ISO.weekOfYear()),
                weeklyQuantity,
                weeklyRevenue
        );
    }

    private MonthlySalesDataDTO getMonthlySalesData(Long productId) {

        LocalDate today = LocalDate.now();
        LocalDate lastMonthStart = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = lastMonthStart.withDayOfMonth(lastMonthStart.lengthOfMonth());

        BigDecimal monthlyQuantity = saleProductRepository.sumQuantityByProductIdAndDateRange(
                productId, lastMonthStart, lastMonthEnd);
        BigDecimal monthlyRevenue = saleProductRepository.sumRevenueByProductIdAndDateRange(
                productId, lastMonthStart, lastMonthEnd);

        return new MonthlySalesDataDTO(
                lastMonthStart.getYear(),
                lastMonthStart.getMonthValue(),
                monthlyQuantity,
                monthlyRevenue
        );
    }

    private YearlySalesDataDTO getLastYearSalesData(Long productId) {
        LocalDate today = LocalDate.now();
        int lastYear = today.getYear() - 1;
        LocalDate lastYearStart = LocalDate.of(lastYear, 1, 1);
        LocalDate lastYearEnd = LocalDate.of(lastYear, 12, 31);

        BigDecimal yearlyQuantity = saleProductRepository.sumQuantityByProductIdAndDateRange(
                productId, lastYearStart, lastYearEnd);
        BigDecimal yearlyRevenue = saleProductRepository.sumRevenueByProductIdAndDateRange(
                productId, lastYearStart, lastYearEnd);

        return new YearlySalesDataDTO(
                lastYear,
                yearlyQuantity,
                yearlyRevenue
        );
    }

    private List<CustomerSalesDataDTO> getTopCustomersByProductPurchases(Long productId,
                                                                        LocalDate startDate,
                                                                        LocalDate endDate,
                                                                        int limit) {
        List<Long> customerIds = saleProductRepository.findDistinctCustomerIdsByProductIdAndDateRange(productId, startDate, endDate);

        return customerIds.stream()
                .map(customerId -> {
                    String customerName = customerRepository.findCustomerNameById(customerId);
                    String customerEmail = customerRepository.findCustomerEmailById(customerId);
                    BigDecimal totalQuantity = saleProductRepository.sumQuantityByProductIdCustomerIdAndDateRange(productId, customerId, startDate, endDate);
                    BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdCustomerIdAndDateRange(productId, customerId, startDate, endDate);
                    Integer numberOfPurchases = saleProductRepository.countSalesByProductIdCustomerIdAndDateRange(productId, customerId, startDate, endDate);
                    LocalDate lastOrderDate = saleRepository.findLastSaleDateByCustomerId(customerId);

                    BigDecimal averagePrice = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                            totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    return new CustomerSalesDataDTO(
                            customerId,
                            customerName,
                            customerEmail,
                            totalQuantity,
                            totalRevenue,
                            numberOfPurchases,
                            averagePrice,
                            lastOrderDate

                    );
                })
                .sorted((c1, c2) -> c2.totalRevenue().compareTo(c1.totalRevenue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<LocationSalesDataDTO> getTopLocationsByProductSales(Long productId,
                                                                    LocalDate startDate,
                                                                    LocalDate endDate,
                                                                    int limit) {
        List<Long> locationIds = saleProductRepository.findDistinctLocationIdsByProductIdAndDateRange(productId, startDate, endDate);

        return locationIds.stream()
                .map(locationId -> {
                    String locationName = locationRepository.findLocationNameById(locationId);
                    BigDecimal totalQuantity = saleProductRepository.sumQuantityByProductIdLocationIdAndDateRange(productId, locationId, startDate, endDate);
                    BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdLocationIdAndDateRange(productId, locationId, startDate, endDate);
                    Integer numberOfSales = saleProductRepository.countSalesByProductIdLocationIdAndDateRange(productId, locationId, startDate, endDate);

                    BigDecimal averagePrice = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                            totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP) :
                            BigDecimal.ZERO;

                    return new LocationSalesDataDTO(
                            locationId,
                            locationName,
                            totalQuantity,
                            totalRevenue,
                            numberOfSales,
                            averagePrice
                    );
                })
                .sorted((l1, l2) -> l2.revenue().compareTo(l1.revenue()))
                .limit(limit)
                .collect(Collectors.toList());

    }

    public List<ProductStatsSummaryDTO> getTopProductsByRevenue(LocalDate startDate,
                                                                LocalDate endDate,
                                                                int limit) {
        // Get distinct products that had sales in the period
        List<Long> productIds = saleProductRepository.findDistinctProductIdsByDateRange(startDate, endDate);

        return productIds.stream()
                .map(productId -> {
                    String productName = productRepository.findProductNameById(productId);
                    String productCode = productRepository.findProductCodeById(productId);
                    BigDecimal totalQuantity = saleProductRepository.sumQuantityByProductIdAndDateRange(productId, startDate, endDate);
                    BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdAndDateRange(productId, startDate, endDate);
                    LocalDate lastSaleDate = productRepository.findLastSaleDateByProductId(productId);

                    return new ProductStatsSummaryDTO(
                            productId,
                            productName,
                            productCode,
                            totalQuantity,
                            totalRevenue,
                            lastSaleDate
                    );
                })
                .sorted((p1, p2) -> p2.totalRevenue().compareTo(p1.totalRevenue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Paginated<ProductStatsSummaryDTO> getAllTopProductsForPeriod(LocalDate startDate,
                                                                        LocalDate endDate,
                                                                        Pageable pageable) {
        // Get distinct products that had sales in the period
        List<Long> productIds = saleProductRepository.findDistinctProductIdsByDateRange(startDate, endDate);

        // Calculate stats for all products
        List<ProductStatsSummaryDTO> allProducts = productIds.stream()
                .map(productId -> {
                    String productName = productRepository.findProductNameById(productId);
                    String productCode = productRepository.findProductCodeById(productId);
                    BigDecimal totalQuantity = saleProductRepository.sumQuantityByProductIdAndDateRange(productId, startDate, endDate);
                    BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdAndDateRange(productId, startDate, endDate);
                    LocalDate lastSaleDate = productRepository.findLastSaleDateByProductId(productId);

                    return new ProductStatsSummaryDTO(
                            productId,
                            productName,
                            productCode,
                            totalQuantity,
                            totalRevenue,
                            lastSaleDate
                    );
                })
                .sorted((p1, p2) -> p2.totalRevenue().compareTo(p1.totalRevenue()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allProducts.size());

        List<ProductStatsSummaryDTO> pageContent = new ArrayList<>();
        if (start < allProducts.size()) {
            pageContent = allProducts.subList(start, end);
        }

        // Use our second Paginated constructor with manual pagination data
        return new Paginated<>(
                pageContent,                    // content
                pageable.getPageNumber(),       // currentPage
                pageable.getPageSize(),         // pageSize
                allProducts.size()             // totalElements
        );
    }

    private Product getProductEntityById(Long productId) throws EntityNotFoundException {
        return productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product", "Product with id " + productId + " not found"));
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
                getWeeklySalesData(product.getId()), // weeklyData
                getMonthlySalesData(product.getId()), // monthlyData
                getLastYearSalesData(product.getId()), // yearlyData
                Collections.emptyList(), // topLocations
                Collections.emptyList(), // topCustomers
                null, // lastSaleDate
                BigDecimal.valueOf(product.getStock()),
                product.getIsActive()
        );
    }
}
