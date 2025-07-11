package gr.aueb.cf.bluemargarita.service;


import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSalesSpecification;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.Location;
import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.model.SaleProduct;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.SaleProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductSalesAnalyticsService {

    private final SaleProductRepository saleProductRepository;
    private final ProductRepository productRepository;

    @Autowired
    public ProductSalesAnalyticsService(SaleProductRepository saleProductRepository,
                                        ProductRepository productRepository) {
        this.saleProductRepository = saleProductRepository;
        this.productRepository = productRepository;
    }


    public ProductSalesAnalyticsDTO getProductSalesAnalytics(Long productId,
                                                             LocalDate startDate,
                                                             LocalDate endDate)
            throws EntityNotFoundException {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product", "Product with id " + productId + " not found"));

        // Get all sale products for this product in date range
        Specification<SaleProduct> spec = ProductSalesSpecification.productInDateRange(productId, startDate, endDate);
        List<SaleProduct> saleProducts = saleProductRepository.findAll(spec);

        // Calculate core metrics
        ProductSalesMetrics metrics = calculateMetrics(saleProducts);

        // Get daily sales data
        List<DailySalesDataDTO> dailySales = getDailySalesData(productId, startDate, endDate);

        // Get monthly sales data
        List<MonthlySalesDataDTO> monthlySales = getMonthlySalesData(productId, startDate, endDate);

        // Top locations and customers
        List<LocationSalesDataDTO> topLocations = getTopLocationsByProductSales(productId, startDate, endDate, 5);
        List<CustomerSalesDataDTO> topCustomers = getTopCustomersByProductPurchases(productId, startDate, endDate, 5);


        return new ProductSalesAnalyticsDTO(
                productId,
                product.getName(),
                product.getCode(),
                startDate,
                endDate,
                metrics.totalQuantity,
                metrics.totalRevenue,
                metrics.numberOfSales,
                metrics.avgQuantityPerSale,
                metrics.avgRevenuePerSale,
                metrics.avgSellingPrice,
                dailySales,
                monthlySales,
                topLocations,
                topCustomers,
                metrics.lastSaleDate,
                BigDecimal.valueOf(product.getStock()),
                product.getIsActive()
        );
    }

    public List<DailySalesDataDTO> getDailySalesData(Long productId, LocalDate startDate, LocalDate endDate) {
        Specification<SaleProduct> spec = ProductSalesSpecification.productInDateRange(productId, startDate, endDate);
        List<SaleProduct> saleProducts = saleProductRepository.findAll(spec);

        // Group by date and calculate metrics
        Map<LocalDate, List<SaleProduct>> salesByDate = saleProducts.stream()
                .collect(Collectors.groupingBy(sp -> sp.getSale().getSaleDate()));

        return salesByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<SaleProduct> daySales = entry.getValue();
                    ProductSalesMetrics dayMetrics = calculateMetrics(daySales);

                    return new DailySalesDataDTO(
                            date,
                            dayMetrics.totalQuantity,
                            dayMetrics.totalRevenue,
                            dayMetrics.numberOfSales,
                            dayMetrics.avgSellingPrice
                    );
                })
                .sorted(Comparator.comparing(DailySalesDataDTO::date))
                .collect(Collectors.toList());
    }

    public List<MonthlySalesDataDTO> getMonthlySalesData(Long productId, LocalDate startDate, LocalDate endDate) {
        Specification<SaleProduct> spec = ProductSalesSpecification.productInDateRange(productId, startDate, endDate);
        List<SaleProduct> saleProducts = saleProductRepository.findAll(spec);

        // Group by year-month
        Map<String, List<SaleProduct>> salesByMonth = saleProducts.stream()
                .collect(Collectors.groupingBy(sp -> {
                    LocalDate date = sp.getSale().getSaleDate();
                    return String.format("%04d-%02d", date.getYear(), date.getMonthValue());
                }));

        return salesByMonth.entrySet().stream()
                .map(entry -> {
                    String monthYear = entry.getKey();
                    List<SaleProduct> monthSales = entry.getValue();
                    ProductSalesMetrics monthMetrics = calculateMetrics(monthSales);

                    return new MonthlySalesDataDTO(
                            monthYear,
                            monthMetrics.totalQuantity,
                            monthMetrics.totalRevenue,
                            monthMetrics.numberOfSales,
                            monthMetrics.avgSellingPrice
                    );
                })
                .sorted(Comparator.comparing(MonthlySalesDataDTO::monthYear))
                .collect(Collectors.toList());
    }

    public List<CustomerSalesDataDTO> getTopCustomersByProductPurchases(Long productId,
                                                                        LocalDate startDate,
                                                                        LocalDate endDate,
                                                                        int limit) {
        Specification<SaleProduct> spec = ProductSalesSpecification.productInDateRange(productId, startDate, endDate);
        List<SaleProduct> saleProducts = saleProductRepository.findAll(spec);

        // Group by customer (handle walk-in customers)
        Map<Customer, List<SaleProduct>> salesByCustomer = saleProducts.stream()
                .filter(sp -> sp.getSale().getCustomer() != null) // Skip walk-in sales
                .collect(Collectors.groupingBy(sp -> sp.getSale().getCustomer()));

        return salesByCustomer.entrySet().stream()
                .map(entry -> {
                    Customer customer = entry.getKey();
                    List<SaleProduct> customerSales = entry.getValue();
                    ProductSalesMetrics customerMetrics = calculateMetrics(customerSales);

                    return new CustomerSalesDataDTO(
                            customer.getId(),
                            customer.getFullName(),
                            customer.getEmail(),
                            customerMetrics.totalQuantity,
                            customerMetrics.totalRevenue,
                            customerMetrics.numberOfSales,
                            customerMetrics.lastSaleDate
                    );
                })
                .sorted(Comparator.comparing(CustomerSalesDataDTO::quantityPurchased, Comparator.reverseOrder()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<LocationSalesDataDTO> getTopLocationsByProductSales(Long productId,
                                                                    LocalDate startDate,
                                                                    LocalDate endDate,
                                                                    int limit) {
        Specification<SaleProduct> spec = ProductSalesSpecification.productInDateRange(productId, startDate, endDate);
        List<SaleProduct> saleProducts = saleProductRepository.findAll(spec);

        // Group by location
        Map<Location, List<SaleProduct>> salesByLocation = saleProducts.stream()
                .collect(Collectors.groupingBy(sp -> sp.getSale().getLocation()));

        return salesByLocation.entrySet().stream()
                .map(entry -> {
                    Location location = entry.getKey();
                    List<SaleProduct> locationSales = entry.getValue();
                    ProductSalesMetrics locationMetrics = calculateMetrics(locationSales);

                    return new LocationSalesDataDTO(
                            location.getId(),
                            location.getName(),
                            locationMetrics.totalQuantity,
                            locationMetrics.totalRevenue,
                            locationMetrics.numberOfSales,
                            locationMetrics.avgSellingPrice
                    );
                })
                .sorted(Comparator.comparing(LocationSalesDataDTO::revenue, Comparator.reverseOrder()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Helper method to calculate metrics from SaleProduct list
    private ProductSalesMetrics calculateMetrics(List<SaleProduct> saleProducts) {
        if (saleProducts.isEmpty()) {
            return new ProductSalesMetrics(
                    BigDecimal.ZERO, BigDecimal.ZERO, 0,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, null
            );
        }

        BigDecimal totalQuantity = saleProducts.stream()
                .map(SaleProduct::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = saleProducts.stream()
                .map(sp -> sp.getQuantity().multiply(sp.getPriceAtTheTime()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate lastDate = saleProducts.stream()
                .map(sp -> sp.getSale().getSaleDate())
                .max(Comparator.naturalOrder())
                .orElse(null);

        // Count unique sales
        int numberOfSales = (int) saleProducts.stream()
                .map(sp -> sp.getSale().getId())
                .distinct()
                .count();

        BigDecimal avgQuantityPerSale = numberOfSales > 0 ?
                totalQuantity.divide(BigDecimal.valueOf(numberOfSales), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        BigDecimal avgRevenuePerSale = numberOfSales > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(numberOfSales), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        BigDecimal avgSellingPrice = totalQuantity.compareTo(BigDecimal.ZERO) > 0 ?
                totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return new ProductSalesMetrics(
                totalQuantity, totalRevenue, numberOfSales,
                avgQuantityPerSale, avgRevenuePerSale, avgSellingPrice, lastDate
        );
    }

    // Helper record for metrics
    private record ProductSalesMetrics(
            BigDecimal totalQuantity,
            BigDecimal totalRevenue,
            int numberOfSales,
            BigDecimal avgQuantityPerSale,
            BigDecimal avgRevenuePerSale,
            BigDecimal avgSellingPrice,
            LocalDate lastSaleDate
    ) {}

}
