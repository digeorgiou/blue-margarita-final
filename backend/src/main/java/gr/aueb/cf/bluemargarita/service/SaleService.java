package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.sale.PaginatedFilteredSalesWithSummary;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.core.specifications.SaleSpecification;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.dto.price_calculation.CartItemDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class SaleService implements ISaleService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SaleService.class);

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;
    private final UserService userService;

    private final IStockManagementService stockManagementService;

    private final SalePricingService pricingService;
    private final Mapper mapper;

    @Autowired
    public SaleService(SaleRepository saleRepository,
                       ProductRepository productRepository,
                       CustomerRepository customerRepository,
                       LocationRepository locationRepository,
                       UserService userService,
                       IStockManagementService stockManagementService,
                       SalePricingService pricingService,
                       Mapper mapper) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.userService = userService;
        this.stockManagementService = stockManagementService;
        this.pricingService = pricingService;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleDetailedViewDTO recordSale(RecordSaleRequestDTO request)
            throws EntityNotFoundException {

        //Validate location , customer and user exist
        Location location = getLocationEntityById(request.locationId());
        Customer customer = getCustomerEntityByIdIfProvided(request.customerId());
        User creator = userService.getCurrentUserOrThrow();

        //Validate all Products exist and retrieve them
        Map<Product, BigDecimal> productQuantities = validateAndCollectProducts(request.items());

        //Create base sale entity (without products)
        Sale sale = createBaseSale(request, location, customer, creator);

        //Add products in the sale
        addProductsToSale(sale, productQuantities);

        //calculate and apply pricing
        pricingService.applySalePricing(sale, request.finalPrice());

        //save sale to get the id
        Sale savedSale = saleRepository.save(sale);

        //update stock for products included in the sale
        updateProductStockAfterSale(productQuantities, sale.getId());

        //if first time customer , set first sale date
        updateCustomerFirstSaleDate(customer, request.saleDate());

        LOGGER.info("Sale recorded with id: {}", savedSale.getId());

        return mapper.mapToSaleDetailedViewDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO updateSale(SaleUpdateDTO dto)
            throws EntityNotFoundException {

        Sale existingSale = getSaleEntityById(dto.saleId());

        Location location = getLocationEntityById(dto.locationId());
        Customer customer = getCustomerEntityByIdIfProvided(dto.customerId());
        User updater = userService.getCurrentUserOrThrow();

        // Update basic fields
        updateSaleBasicFields(existingSale, dto, location, customer, updater);

        pricingService.recalculateSalePricing(existingSale);

        Sale savedSale = saleRepository.save(existingSale);

        LOGGER.info("Sale {} updated by user {}", savedSale.getId(), updater.getUsername());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSale(Long saleId) throws EntityNotFoundException {

        Sale sale = getSaleEntityById(saleId);

        // Restore stock before deleting sale
        restoreProductStockAfterSaleDeletion(sale);

        saleRepository.delete(sale);
        LOGGER.info("Sale {} deleted", saleId);
    }

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<SaleReadOnlyDTO> getRecentSales(int limit) {
        return saleRepository.findAll(
                        PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "saleDate", "createdAt"))
                )
                .stream()
                .map(mapper::mapToSaleReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SalesSummaryDTO getWeeklySalesSummary() {
        LOGGER.debug("Retrieving weekly sales summary");

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);

        return calculateSalesSummaryForDateRange(weekStart, weekEnd);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesSummaryDTO getMonthlySalesSummary() {
        LOGGER.debug("Retrieving monthly sales summary");

        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());

        return calculateSalesSummaryForDateRange(monthStart, monthEnd);
    }

    // =============================================================================
    // VIEW SALES PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public PaginatedFilteredSalesWithSummary searchSalesWithSummary(SaleFilters filters) {

        Page<SaleReadOnlyDTO> filtered = saleRepository.findAll(getSpecsFromFilters(filters), filters.getPageable())
                .map(mapper::mapToSaleReadOnlyDTO);

        long totalFilteredResults = filtered.getTotalElements();
        SalesSummaryDTO summary = null;

        // Only calculate summary if total results are 100 or less
        if (totalFilteredResults <= 100) {
            summary = calculateSalesSummary(filters);
        }

        return new PaginatedFilteredSalesWithSummary(filtered, summary);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleDetailedViewDTO getSaleDetailedView(Long saleId) throws EntityNotFoundException {

        Sale sale = getSaleEntityById(saleId);

        return mapper.mapToSaleDetailedViewDTO(sale);
    }

    // =============================================================================
    // RECORD SALE PAGE METHODS
    // =============================================================================

    @Transactional(readOnly = true)
    public List<PaymentMethodDTO> getAvailablePaymentMethods() {
        return Arrays.stream(PaymentMethod.values())
                .map(method -> new PaymentMethodDTO(method, method.getDisplayName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CartItemDTO getProductForCart(Long productId, BigDecimal quantity, boolean isWholesale)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);

        BigDecimal suggestedPrice = isWholesale ?
                product.getFinalSellingPriceWholesale() :
                product.getFinalSellingPriceRetail();

        BigDecimal totalPrice = suggestedPrice.multiply(quantity);

        return new CartItemDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                quantity,
                suggestedPrice,
                totalPrice
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PriceCalculationResponseDTO calculateCartPricing(PriceCalculationRequestDTO request)
            throws EntityNotFoundException {

        List<CartItemDTO> calculatedItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        // Calculate each item
        for (SaleItemRequestDTO item : request.items()) {
            CartItemDTO cartItem = getProductForCart(item.productId(), item.quantity(), request.isWholesale());
            calculatedItems.add(cartItem);
            subtotal = subtotal.add(cartItem.totalPrice());
        }

        return pricingService.calculatePricing(calculatedItems, subtotal, request);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Sale getSaleEntityById(Long id) throws EntityNotFoundException {
        return saleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sale", "Sale with id " + id + " not found"));
    }

    private Location getLocationEntityById(Long id) throws EntityNotFoundException {
        return locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location",
                        "Location with id=" + id + " was not found"));
    }

    private Customer getCustomerEntityByIdIfProvided(Long customerId) throws EntityNotFoundException {
        if (customerId == null) {
            return null;
        }
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer",
                        "Customer with id=" + customerId + " was not found"));
    }

    private Product getProductEntityById(Long id) throws EntityNotFoundException {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product",
                        "Product with id=" + id + " was not found"));
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Business Logic
    // =============================================================================

    private Map<Product, BigDecimal> validateAndCollectProducts(List<SaleItemRequestDTO> items)
            throws EntityNotFoundException {

        Map<Product, BigDecimal> productQuantities = new HashMap<>();

        for (SaleItemRequestDTO item : items) {
            Product product = getProductEntityById(item.productId());
            productQuantities.put(product, item.quantity());

            LOGGER.debug("Validated product {} with quantity {}",
                    product.getCode(), item.quantity());
        }

        return productQuantities;
    }

    private Sale createBaseSale(RecordSaleRequestDTO request, Location location,
                                Customer customer, User creator) {

        Sale sale = Sale.builder()
                .customer(customer)
                .location(location)
                .saleDate(request.saleDate())
                .finalTotalPrice(request.finalPrice())
                .packagingPrice(request.packagingCost())
                .paymentMethod(request.paymentMethod())
                .isWholesale(request.isWholesale())
                .build();

        // Set audit fields
        sale.setCreatedBy(creator);
        sale.setLastUpdatedBy(creator);

        return sale;
    }

    private void addProductsToSale(Sale sale, Map<Product, BigDecimal> productQuantities) {
        for (Map.Entry<Product, BigDecimal> entry : productQuantities.entrySet()) {
            sale.addProduct(entry.getKey(), entry.getValue());

            LOGGER.debug("Added product {} quantity {} to sale",
                    entry.getKey().getCode(), entry.getValue());
        }
    }


    private void updateSaleBasicFields(Sale sale, SaleUpdateDTO dto, Location location,
                                       Customer customer, User updater) {
        sale.setCustomer(customer);
        sale.setLocation(location);
        sale.setSaleDate(dto.saleDate());
        sale.setFinalTotalPrice(dto.finalTotalPrice());
        sale.setPackagingPrice(dto.packagingPrice());
        sale.setPaymentMethod(dto.paymentMethod());
        sale.setLastUpdatedBy(updater);
    }


    // =============================================================================
    // PRIVATE HELPER METHODS - Stock Management (Simple Repository Calls)
    // =============================================================================

    private void updateProductStockAfterSale(Map<Product, BigDecimal> productQuantities, Long saleId){
        stockManagementService.reduceStockAfterSale(productQuantities, saleId);
        LOGGER.debug("Stock reduced for sale {} with {} products", saleId, productQuantities.size());
    }

    private void restoreProductStockAfterSaleDeletion(Sale sale){
        // Convert SaleProducts to Product-quantity map
        Map<Product, BigDecimal> productQuantities = sale.getAllSaleProducts()
                .stream()
                .collect(Collectors.toMap(
                        SaleProduct::getProduct,
                        SaleProduct::getQuantity
                ));

        stockManagementService.restoreStockAfterSaleDeleted(productQuantities, sale.getId());
        LOGGER.debug("Stock restored for deleted sale {} with {} products",
                sale.getId(), productQuantities.size());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Customer Management
    // =============================================================================

    private void updateCustomerFirstSaleDate(Customer customer, LocalDate saleDate) {
        if (customer != null && customer.getFirstSaleDate() == null) {
            customer.setFirstSaleDate(saleDate);
            customerRepository.save(customer);
            LOGGER.debug("Updated first sale date for customer {} to {}",
                    customer.getFullName(), saleDate);
        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Analytics and Filtering
    // =============================================================================

    private SalesSummaryDTO calculateSalesSummaryForDateRange(LocalDate startDate, LocalDate endDate) {
        Integer count = saleRepository.countSalesByDateRange(startDate, endDate);
        BigDecimal revenue = saleRepository.sumRevenueByDateRange(startDate, endDate);
        BigDecimal avgOrder = saleRepository.calculateAverageOrderValueByDateRange(startDate, endDate);

        return new SalesSummaryDTO(
                count != null ? count : 0,
                revenue != null ? revenue : BigDecimal.ZERO,
                avgOrder != null ? avgOrder : BigDecimal.ZERO,
                BigDecimal.ZERO, // totalDiscount
                BigDecimal.ZERO  // avgDiscount
        );
    }


    private SalesSummaryDTO calculateSalesSummary(SaleFilters filters) {

        Integer totalCount = countSalesByFilters(filters);

        if (totalCount == 0) {
            return createEmptySalesSummary();
        }

        BigDecimal totalRevenue = sumRevenueByFilters(filters);
        BigDecimal totalDiscountAmount = sumDiscountAmountByFilters(filters);
        BigDecimal avgDiscountPercentage = avgDiscountPercentageByFilters(filters);

        BigDecimal avgOrderValue = totalCount > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        LOGGER.debug("Summary calculated: count={}, revenue={}, avgOrder={}",
                totalCount, totalRevenue, avgOrderValue);

        return new SalesSummaryDTO(
                totalCount,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                avgOrderValue,
                totalDiscountAmount != null ? totalDiscountAmount : BigDecimal.ZERO,
                avgDiscountPercentage != null ? avgDiscountPercentage : BigDecimal.ZERO
        );
    }

    private SalesSummaryDTO createEmptySalesSummary() {
        return new SalesSummaryDTO(0, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private Integer countSalesByFilters(SaleFilters filters) {
        Specification<Sale> spec = getSpecsFromFilters(filters);
        return (int) saleRepository.count(spec);
    }

    private BigDecimal sumRevenueByFilters(SaleFilters filters) {
        Specification<Sale> spec = getSpecsFromFilters(filters);
        List<Sale> sales = saleRepository.findAll(spec);

        return sales.stream()
                .map(Sale::getFinalTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumDiscountAmountByFilters(SaleFilters filters) {
        Specification<Sale> spec = getSpecsFromFilters(filters);
        List<Sale> sales = saleRepository.findAll(spec);

        return sales.stream()
                .filter(sale -> sale.getSuggestedTotalPrice() != null && sale.getFinalTotalPrice() != null)
                .map(sale -> sale.getSuggestedTotalPrice().subtract(sale.getFinalTotalPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal avgDiscountPercentageByFilters(SaleFilters filters) {
        Specification<Sale> spec = getSpecsFromFilters(filters);
        List<Sale> sales = saleRepository.findAll(spec);
        if (sales.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDiscount = sales.stream()
                .map(Sale::getDiscountPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalDiscount.divide(BigDecimal.valueOf(sales.size()), 2, RoundingMode.HALF_UP);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================
    private Specification<Sale> getSpecsFromFilters(SaleFilters filters) {


        return Specification
                .where(SaleSpecification.hasCategoryId(filters.getCategoryId()))
                .and(SaleSpecification.hasDateBetween(filters.getSaleDateFrom(), filters.getSaleDateTo()))
                .and(SaleSpecification.hasLocationId(filters.getLocationId()))
                .and(SaleSpecification.hasPaymentMethod(filters.getPaymentMethod()))
                .and(SaleSpecification.hasCustomerId(filters.getCustomerId()))
                .and(SaleSpecification.hasProductId(filters.getProductId()))
                .and(SaleSpecification.isWholesale(filters.getIsWholesale()));
    }
}