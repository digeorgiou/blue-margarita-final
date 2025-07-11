package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.dto.sale.PaginatedFilteredSalesWithSummary;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.CustomerSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.SaleSpecification;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.dto.shopping_cart.CartItemDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final SalePricingService pricingService;
    private final Mapper mapper;

    @Autowired
    public SaleService(SaleRepository saleRepository,
                       ProductRepository productRepository,
                       CustomerRepository customerRepository,
                       LocationRepository locationRepository,
                       UserRepository userRepository,
                       SalePricingService pricingService,
                       Mapper mapper) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleDetailedViewDTO recordSale(RecordSaleRequestDTO request)
            throws EntityNotFoundException, EntityInvalidArgumentException {

        // Validate location exists
        Location location = getLocationById(request.locationId());

        // Validate customer exists (if provided)
        Customer customer = null;
        if (request.customerId() != null) {
            customer = getCustomerById(request.customerId());
        }

        // Validate creator user exists
        User creator = getUserById(request.creatorUserId());

        // Validate products and build product map
        Map<Long, BigDecimal> productQuantities = request.items().stream()
                .collect(Collectors.toMap(
                        SaleItemRequestDTO::productId,
                        SaleItemRequestDTO::quantity
                ));

        Map<Product, BigDecimal> productEntitiesQuantities = new HashMap<>();

        for (Map.Entry<Long, BigDecimal> entry : productQuantities.entrySet()){
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


        for (Map.Entry<Product, BigDecimal> entry : productEntitiesQuantities.entrySet()) {
            sale.addProduct(entry.getKey(), entry.getValue());
        }

        // Calculate and update pricing using the service
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        // Update customer's first sale date if needed
        updateCustomerFirstSaleDate(customer, request.saleDate());

        LOGGER.info("Sale created with id: {}, Suggested total: {}, Final total: {}, Discount: {}%",
                savedSale.getId(),
                savedSale.getSuggestedTotalPrice(),
                savedSale.getFinalTotalPrice(),
                savedSale.getDiscountPercentage());

        // Convert to RecordSaleResponseDTO
        return getSaleDetailedView(savedSale.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO updateSale(SaleUpdateDTO dto)
            throws EntityNotFoundException, EntityInvalidArgumentException {

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
        saleRepository.delete(sale);
        LOGGER.info("Sale {} deleted", saleId);
    }

    // =============================================================================
    // RECORD SALE PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductSearchResultDTO> searchProductsForSale(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String cleanTerm = searchTerm.trim();

        Specification<Product> spec = Specification
                .where(ProductSpecification.productNameLike(cleanTerm))
                .or(ProductSpecification.productCodeLike(cleanTerm))
                .and(ProductSpecification.productIsActive(true));

        return productRepository.findAll(spec)
                .stream()
                .map(product -> new ProductSearchResultDTO(
                        product.getId(),
                        product.getName(),
                        product.getCode(),
                        product.getCategory().getName(),
                        product.getFinalSellingPriceRetail(),
                        product.getFinalSellingPriceWholesale(),
                        product.getIsActive()
                ))
                .limit(20) // Limit results for performance
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerSearchResultDTO> searchCustomersForSale(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String cleanTerm = searchTerm.trim();

        Specification<Customer> spec = Specification
                .where(CustomerSpecification.customerStringFieldLike("firstname", cleanTerm))
                .or(CustomerSpecification.customerStringFieldLike("lastname", cleanTerm))
                .or(CustomerSpecification.customerStringFieldLike("email", cleanTerm))
                .or(CustomerSpecification.customerStringFieldLike("phoneNumber", cleanTerm))
                .and(CustomerSpecification.customerIsActive(true));

        return customerRepository.findAll(spec)
                .stream()
                .map(customer -> new CustomerSearchResultDTO(
                        customer.getId(),
                        customer.getFullName(),
                        customer.getEmail(),
                        customer.getPhoneNumber(),
                        customer.getIsActive()
                ))
                .limit(20) // Limit results for performance
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationForDropdownDTO> getActiveLocationsForSale() {
        return locationRepository.findByIsActiveTrue()
                .stream()
                .map(location -> new LocationForDropdownDTO(
                        location.getId(),
                        location.getName(),
                        location.getIsActive()
                ))
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
    // SALES VIEW PAGE METHODS
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
                        new CustomerInfoDTO(
                                sale.getCustomer().getId(),
                                sale.getCustomer().getFullName(),
                                sale.getCustomer().getEmail()
                        ) : null ,
                new LocationInfoDTO(
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
    // PRIVATE HELPER METHODS
    // =============================================================================

    private void updateSalePricingWithDiscount(Sale sale) {
        BigDecimal suggestedTotal = pricingService.calculateSuggestedTotalFromSale(sale);
        sale.setSuggestedTotalPrice(suggestedTotal);

        // Calculate discount percentage based on final vs suggested price
        BigDecimal  discountPercentage = BigDecimal.ZERO;
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

    private Sale getSaleEntityById(Long id) throws EntityNotFoundException {
        return saleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sale", "Sale with id " + id + " not found"));
    }

    private void updateCustomerFirstSaleDate(Customer customer, LocalDate saleDate) {
        if (customer != null && customer.getFirstSaleDate() == null) {
            customer.setFirstSaleDate(saleDate);
            customerRepository.save(customer);
        }
    }

    private Specification<Sale> getSpecsFromFilters(SaleFilters filters) {
        return Specification
                .where(SaleSpecification.hasProductNameOrCode(filters.getProductNameOrCode()))
                .and(SaleSpecification.hasCustomer(filters.getCustomerId()))
                .and(SaleSpecification.hasProductCategory(filters.getCategoryId()))
                .and(SaleSpecification.hasDateBetween(filters.getSaleDateFrom(), filters.getSaleDateTo()))
                .and(SaleSpecification.hasLocation(filters.getLocationId()))
                .and(SaleSpecification.hasPaymentMethod(filters.getPaymentMethod()));

    }

    private SalesSummaryDTO calculateSalesSummary(SaleFilters filters){
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