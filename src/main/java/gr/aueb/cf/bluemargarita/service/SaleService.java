package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerInfoDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.sale.PaginatedFilteredSalesWithSummary;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.core.specifications.CustomerSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.SaleSpecification;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.dto.shopping_cart.CartItemDTO;
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

@Service
public class SaleService implements ISaleService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SaleService.class);

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    private final ProductService productService;
    private final CustomerService customerService;
    private final LocationService locationService;
    private final CategoryService categoryService;

    private final SalePricingService pricingService;
    private final Mapper mapper;

    @Autowired
    public SaleService(SaleRepository saleRepository,
                       ProductRepository productRepository,
                       CustomerRepository customerRepository,
                       LocationRepository locationRepository,
                       UserRepository userRepository,
                       ProductService productService,
                       CustomerService customerService,
                       LocationService locationService,
                       CategoryService categoryService,
                       SalePricingService pricingService,
                       Mapper mapper) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.customerService = customerService;
        this.locationService = locationService;
        this.categoryService = categoryService;
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

        // Validate location exists
        Location location = getLocationById(request.locationId());

        // Validate customer exists (if provided)
        Customer customer = null;
        if (request.customerId() != null) {
            customer = getCustomerById(request.customerId());
        }

        // Validate creator user exists
        User creator = getUserById(request.creatorUserId());

        // Build product map
        Map<Long, BigDecimal> productQuantities = request.items().stream()
                .collect(Collectors.toMap(
                        SaleItemRequestDTO::productId,
                        SaleItemRequestDTO::quantity
                ));

        Map<Product, BigDecimal> productEntitiesQuantities = new HashMap<>();

        for (Map.Entry<Long, BigDecimal> entry : productQuantities.entrySet()) {
            Product product = getProductById(entry.getKey());
            productEntitiesQuantities.put(product, entry.getValue());
        }

        // Create sale entity with basic fields
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

        // Add products to sale
        for (Map.Entry<Product, BigDecimal> entry : productEntitiesQuantities.entrySet()) {
            sale.addProduct(entry.getKey(), entry.getValue());
        }

        // Calculate pricing
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        for (Map.Entry<Long, BigDecimal> entry : productQuantities.entrySet()) {
            try {
                productService.reduceProductStock(entry.getKey(), entry.getValue());
            } catch (EntityNotFoundException e) {
                LOGGER.error("Product {} not found when reducing stock for sale {}",
                        entry.getKey(), savedSale.getId());
            }
        }

        // Update customer's first sale date if needed
        updateCustomerFirstSaleDate(customer, request.saleDate());

        LOGGER.info("Sale created with id: {}, Suggested total: {}, Final total: {}, Discount: {}%",
                savedSale.getId(),
                savedSale.getSuggestedTotalPrice(),
                savedSale.getFinalTotalPrice(),
                savedSale.getDiscountPercentage());

        // Convert to RecordSaleDetailedView DTO
        return getSaleDetailedView(savedSale.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO updateSale(SaleUpdateDTO dto)
            throws EntityNotFoundException {

        Sale existingSale = getSaleEntityById(dto.saleId());
        Location location = getLocationById(dto.locationId());
        Customer customer = dto.customerId() != null ? getCustomerById(dto.customerId()) : null;
        User updater = getUserById(dto.updaterUserId());

        // Update basic fields
        existingSale.setCustomer(customer);
        existingSale.setLocation(location);
        existingSale.setSaleDate(dto.saleDate());
        existingSale.setFinalTotalPrice(dto.finalTotalPrice());
        existingSale.setPackagingPrice(dto.packagingPrice());
        existingSale.setPaymentMethod(dto.paymentMethod());
        existingSale.setLastUpdatedBy(updater);

        // Recalculate pricing
        updateSalePricingWithDiscount(existingSale);

        Sale savedSale = saleRepository.save(existingSale);

        LOGGER.info("Sale {} updated by user {}", savedSale.getId(), updater.getUsername());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSale(Long saleId) throws EntityNotFoundException {
        Sale sale = getSaleEntityById(saleId);

        // Restore stock before deleting sale
        for (SaleProduct saleProduct : sale.getAllSaleProducts()) {
            try {
                productService.increaseProductStock(
                        saleProduct.getProduct().getId(),
                        saleProduct.getQuantity()
                );
            } catch (EntityNotFoundException e) {
                LOGGER.error("Product {} not found when restoring stock for deleted sale {}",
                        saleProduct.getProduct().getCode(), saleId);
                // Continue with deletion
            }
        }

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
    public SalesSummaryDTO getDailySalesSummary() {
        LocalDate today = LocalDate.now();
        SaleFilters filters = SaleFilters.builder()
                .saleDateFrom(today)
                .saleDateTo(today)
                .build();

        return calculateSalesSummary(filters);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesSummaryDTO getWeeklySalesSummary() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);

        SaleFilters filters = SaleFilters.builder()
                .saleDateFrom(weekStart)
                .saleDateTo(weekEnd)
                .build();

        return calculateSalesSummary(filters);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesSummaryDTO getMonthlySalesSummary() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());

        SaleFilters filters = SaleFilters.builder()
                .saleDateFrom(monthStart)
                .saleDateTo(monthEnd)
                .build();

        return calculateSalesSummary(filters);
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
            // Get all filtered results for summary calculation
            List<Sale> allFilteredSales = saleRepository.findAll(getSpecsFromFilters(filters));

            int totalCount = allFilteredSales.size();

            summary = calculateSalesSummary(filters);
        }

        return new PaginatedFilteredSalesWithSummary(filtered, summary);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleDetailedViewDTO getSaleDetailedView(Long saleId) throws EntityNotFoundException {

        Sale sale = getSaleEntityById(saleId);

        BigDecimal totalItemCount = sale.getAllSaleProducts().stream()
                .map(SaleProduct::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageItemPrice = totalItemCount.compareTo(BigDecimal.ZERO) > 0 ?
                sale.getFinalTotalPrice().divide(totalItemCount, 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return new SaleDetailedViewDTO(
                saleId,
                sale.getSaleDate(),
                sale.getCustomer() != null ?
                        new CustomerSearchResultDTO(
                                sale.getCustomer().getId(),
                                sale.getCustomer().getFullName(),
                                sale.getCustomer().getEmail()
                        ) : null,
                new LocationForDropdownDTO(
                        sale.getLocation().getId(),
                        sale.getLocation().getName()
                ),
                sale.getPaymentMethod(),
                sale.getSuggestedTotalPrice().subtract(sale.getPackagingPrice()), //subtotal
                sale.getPackagingPrice(),
                sale.getSuggestedTotalPrice(),
                sale.getFinalTotalPrice(),
                sale.getSuggestedTotalPrice().subtract(sale.getFinalTotalPrice()),
                sale.getDiscountPercentage(),

                sale.getAllSaleProducts().stream()
                        .map(mapper::mapToSaleItemDetailsDTO)
                        .collect(Collectors.toList()),
                sale.getIsWholesale(),
                totalItemCount.intValue(),
                averageItemPrice

        );
    }

    // =============================================================================
    // RECORD SALE PAGE METHODS
    // =============================================================================

    @Transactional(readOnly = true)
    public List<PaymentMethodDTO> getAvailablePaymentMethods() {
        return Arrays.stream(PaymentMethod.values())
                .map(method -> new PaymentMethodDTO(method, method.name()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CartItemDTO getProductForCart(Long productId, BigDecimal quantity, boolean isWholesale)
            throws EntityNotFoundException {

        Product product = getProductById(productId);

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

        BigDecimal packagingCost = request.packagingCost() != null ? request.packagingCost() : BigDecimal.ZERO;
        BigDecimal suggestedTotal = subtotal.add(packagingCost);

        BigDecimal finalPrice;
        BigDecimal discountAmount;
        BigDecimal discountPercentage;

        // Handle both input scenarios
        if (request.userFinalPrice() != null) {
            // User entered final price - calculate discount
            finalPrice = request.userFinalPrice();
            discountAmount = suggestedTotal.subtract(finalPrice);
            discountPercentage = suggestedTotal.compareTo(BigDecimal.ZERO) > 0 ?
                    discountAmount.divide(suggestedTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) :
                    BigDecimal.ZERO;
        } else if (request.userDiscountPercentage() != null) {
            // User entered discount percentage - calculate final price
            discountPercentage = request.userDiscountPercentage();
            discountAmount = suggestedTotal.multiply(discountPercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            finalPrice = suggestedTotal.subtract(discountAmount);
        } else {
            // No user input - use suggested total
            finalPrice = suggestedTotal;
            discountAmount = BigDecimal.ZERO;
            discountPercentage = BigDecimal.ZERO;
        }

        return new PriceCalculationResponseDTO(
                subtotal,
                packagingCost,
                suggestedTotal,
                finalPrice,
                discountAmount,
                discountPercentage,
                calculatedItems
        );
    }

// =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Sale getSaleEntityById(Long id) throws EntityNotFoundException {
        return saleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sale", "Sale with id " + id + " not found"));
    }

    private Location getLocationById(Long id) throws EntityNotFoundException {
        return locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id " + id + " not found"));
    }

    private Customer getCustomerById(Long id) throws EntityNotFoundException {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id " + id + " not found"));
    }

    private User getUserById(Long id) throws EntityNotFoundException {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + id + " not found"));
    }

    private Product getProductById(Long id) throws EntityNotFoundException {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product", "Product with id " + id + " not found"));
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Business Logic
    // =============================================================================

    /**
     * Updates sale pricing and applies discount to all sale products
     */
    private void updateSalePricingWithDiscount(Sale sale) {
        BigDecimal suggestedTotal = pricingService.calculateSuggestedTotalFromSale(sale);
        sale.setSuggestedTotalPrice(suggestedTotal);

        // Calculate discount percentage based on final vs suggested price
        BigDecimal discountPercentage = BigDecimal.ZERO;
        if (suggestedTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = suggestedTotal.subtract(sale.getFinalTotalPrice());
            discountPercentage = discountAmount.divide(suggestedTotal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        sale.setDiscountPercentage(discountPercentage);

        // Apply proportional discount to each sale product
        for (SaleProduct saleProduct : sale.getAllSaleProducts()) {
            BigDecimal actualPrice = pricingService.calculateActualSellingPrice(
                    saleProduct.getProduct(), discountPercentage);
            saleProduct.setPriceAtTheTime(actualPrice);
        }

        LOGGER.debug("Updated sale {} pricing - Suggested: {}, Final: {}, Discount: {}%",
                sale.getId(), suggestedTotal, sale.getFinalTotalPrice(), discountPercentage);
    }

    /**
     * Updates customer's first sale date if this is their first purchase
     */
    private void updateCustomerFirstSaleDate(Customer customer, LocalDate saleDate) {
        if (customer != null && customer.getFirstSaleDate() == null) {
            customer.setFirstSaleDate(saleDate);
            customerRepository.save(customer);
        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Calculations
    // =============================================================================

    /**
     * Converts SaleFilters to JPA Specifications for database queries
     */
    private Specification<Sale> getSpecsFromFilters(SaleFilters filters) {
        Specification<Sale> spec = Specification
                .where(SaleSpecification.hasCategoryId(filters.getCategoryId()))
                .and(SaleSpecification.hasDateBetween(filters.getSaleDateFrom(), filters.getSaleDateTo()))
                .and(SaleSpecification.hasLocationId(filters.getLocationId()))
                .and(SaleSpecification.hasPaymentMethod(filters.getPaymentMethod()));

        // Product filtering with priority logic
        if (filters.getProductId() != null) {
            // User selected specific product from autocomplete
            spec = spec.and(SaleSpecification.hasProductId(filters.getProductId()));
        } else if (filters.getProductNameOrCode() != null && !filters.getProductNameOrCode().trim().isEmpty()) {
            // User is typing in autocomplete
            spec = spec.and(SaleSpecification.hasProductNameOrCode(filters.getProductNameOrCode()));
        }

        // Customer filtering with priority logic
        if (filters.getCustomerId() != null) {
            // User selected specific customer from autocomplete
            spec = spec.and(SaleSpecification.hasCustomerId(filters.getCustomerId()));
        } else if (filters.getCustomerNameOrEmail() != null && !filters.getCustomerNameOrEmail().trim().isEmpty()) {
            // User is typing in autocomplete
            spec = spec.and(SaleSpecification.hasCustomerNameOrEmail(filters.getCustomerNameOrEmail()));
        }

        return spec;
    }

    /**
     * Calculates sales summary metrics from filtered results
     */
    private SalesSummaryDTO calculateSalesSummary(SaleFilters filters) {
        List<Sale> allFilteredSales = saleRepository.findAll(getSpecsFromFilters(filters));

        int totalCount = allFilteredSales.size();

        if (totalCount == 0) {
            return new SalesSummaryDTO(0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal totalRevenue = allFilteredSales.stream()
                .map(Sale::getFinalTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = totalRevenue.divide(
                BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP);

        BigDecimal totalDiscountAmount = allFilteredSales.stream()
                .map(sale -> sale.getSuggestedTotalPrice().subtract(sale.getFinalTotalPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageDiscountPercentage = allFilteredSales.stream()
                .map(Sale::getDiscountPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP);

        return new SalesSummaryDTO(
                totalCount,
                totalRevenue,
                averageOrderValue,
                totalDiscountAmount,
                averageDiscountPercentage
        );
    }
}