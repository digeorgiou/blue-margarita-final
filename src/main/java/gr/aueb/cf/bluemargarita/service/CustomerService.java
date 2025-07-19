package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.CustomerFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.CustomerSpecification;
import gr.aueb.cf.bluemargarita.dto.customer.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomerService implements ICustomerService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CustomerService.class);
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final SaleProductRepository saleProductRepository;
    private final Mapper mapper;

    @Autowired
    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository, ProductRepository productRepository,
                           SaleRepository saleRepository, SaleProductRepository saleProductRepository, Mapper mapper) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.saleProductRepository = saleProductRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerListItemDTO createCustomer(CustomerInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        validateUniqueEmail(dto.email());
        validateUniqueTin(dto.tin());
        validateUniquePhoneNumber(dto.phoneNumber());

        Customer customer = mapper.mapCustomerInsertToModel(dto);

        User creator = getUserEntityById(dto.creatorUserId());

        customer.setCreatedBy(creator);
        customer.setLastUpdatedBy(creator);

        Customer insertedCustomer = customerRepository.save(customer);

        LOGGER.info("Customer created with id: {}", insertedCustomer.getId());

        return mapper.mapToCustomerListItemDTO(insertedCustomer);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerListItemDTO updateCustomer(CustomerUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Customer existingCustomer = getCustomerEntityById(dto.customerId());

        if(!dto.email().equals(existingCustomer.getEmail())){
            validateUniqueEmail(dto.email());
        }

        if(!dto.phoneNumber().equals(existingCustomer.getPhoneNumber())){
            validateUniquePhoneNumber(dto.phoneNumber());
        }

        if(!dto.tin().equals(existingCustomer.getTin())){
            validateUniqueTin(dto.tin());
        }

        User updater = getUserEntityById(dto.updaterUserId());

        Customer updatedCustomer = mapper.mapCustomerUpdateToModel(dto, existingCustomer);
        updatedCustomer.setLastUpdatedBy(updater);

        Customer savedCustomer = customerRepository.save(updatedCustomer);

        LOGGER.info("Customer {} updated by user {}", savedCustomer.getFullName(), updater.getUsername());

        return mapper.mapToCustomerListItemDTO(savedCustomer);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCustomer(Long id) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(id);

        Integer salesCount = saleRepository.countByCustomerId(id);

        if (salesCount > 0) {
            // Soft Delete if customer has sales history
            customer.setIsActive(false);
            customer.setDeletedAt(LocalDateTime.now());
            customerRepository.save(customer);

            LOGGER.info("Customer {} soft deleted. Has {} sales in history",
                    customer.getFullName(), salesCount);
        } else {
            // Hard delete if customer not used anywhere
            customerRepository.delete(customer);
            LOGGER.info("Customer {} hard deleted (no sales history)", customer.getFullName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerListItemDTO getCustomerById(Long id) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(id);

        return mapper.mapToCustomerListItemDTO(customer);
    }

    // =============================================================================
    // CUSTOMERS VIEW PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<CustomerListItemDTO> getCustomersFilteredPaginated(CustomerFilters filters){

        var filtered =
                customerRepository.findAll(
                        getSpecsFromFilters(filters),
                        filters.getPageable()
                );

        return new Paginated<>(filtered.map(mapper::mapToCustomerListItemDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDetailedViewDTO getCustomerDetailedView(Long customerId)
            throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(customerId);

        // Get analytics data using dedicated methods
        CustomerAnalyticsDTO analytics = getCustomerAnalytics(customerId);
        List<ProductStatsSummaryDTO> topProducts = getTopProductsForCustomer(customerId);

        return mapper.mapToCustomerDetailedViewDTO(customer, analytics, topProducts);
    }

    // =============================================================================
    // RECORD SALE PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<CustomerSearchResultDTO> searchCustomersForAutocomplete(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            return Collections.emptyList();
        }

        Specification<Customer> spec = Specification
                .where(CustomerSpecification.searchMultipleFields(searchTerm.trim()))
                .and(CustomerSpecification.customerIsActive(true));

        return customerRepository.findAll(spec)
                .stream()
                .limit(10)
                .map(customer -> new CustomerSearchResultDTO(
                        customer.getId(),
                        customer.getFullName(),
                        customer.getEmail()
                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Customer getCustomerEntityById(Long id) throws EntityNotFoundException{
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id=" + id + " was not found"));
    }

    private User getUserEntityById(Long userId) throws EntityNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + userId + " was not found"));
    }

    private void validateUniqueEmail(String email) throws EntityAlreadyExistsException {
        if (email != null && customerRepository.existsByEmail(email)) {
            throw new EntityAlreadyExistsException("Customer", "Customer with email " + email + " already exists");
        }
    }

    private void validateUniquePhoneNumber(String phoneNumber) throws EntityAlreadyExistsException {
        if(phoneNumber != null && customerRepository.existsByPhoneNumber(phoneNumber)){
            throw new EntityAlreadyExistsException("Customer", "Customer with phone number " + phoneNumber + " already exists");
        }
    }

    private void validateUniqueTin(String tin) throws EntityAlreadyExistsException {
        if (tin != null && customerRepository.existsByTin(tin)) {
            throw new EntityAlreadyExistsException("Customer", "Customer with TIN " + tin + " already exists");
        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Calculating Analytics
    // =============================================================================

    private List<ProductStatsSummaryDTO> getTopProductsForCustomer(Long customerId) {
        // Get all products purchased by this customer
        List<Long> productIds = saleProductRepository.findDistinctProductIdsByCustomerId(customerId);

        if (productIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Get sales stats for each product for this customer
        return productIds.stream()
                .limit(10) // Limit to top 10 for performance
                .map(productId -> getProductSalesStatsForCustomer(productId, customerId))
                .flatMap(Optional::stream)
                .sorted((p1, p2) -> p2.totalRevenue().compareTo(p1.totalRevenue()))
                .collect(Collectors.toList());
    }

    private Optional<ProductStatsSummaryDTO> getProductSalesStatsForCustomer(Long productId, Long customerId) {
        // Get basic product info
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);

        // Get sales statistics for this customer and product
        BigDecimal totalQuantity = saleProductRepository.sumQuantityByProductIdAndCustomerId(productId, customerId);
        if (totalQuantity == null || totalQuantity.compareTo(BigDecimal.ZERO) == 0) {
            return Optional.empty();
        }

        BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdAndCustomerId(productId, customerId);
        LocalDate lastSaleDate = saleProductRepository.findLastSaleDateByProductIdAndCustomerId(productId, customerId);

        return Optional.of(new ProductStatsSummaryDTO(
                productId,
                productName,
                productCode,
                totalQuantity,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                lastSaleDate
        ));
    }

    private CustomerAnalyticsDTO getCustomerAnalytics(Long customerId) {
        // All-time metrics
        Integer totalSales = saleRepository.countByCustomerId(customerId);
        if(totalSales == 0) {
            return createEmptyCustomerAnalytics();
        }

        BigDecimal totalRevenue = saleRepository.sumRevenueByCustomerId(customerId);
        BigDecimal averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalSales),2, RoundingMode.HALF_UP);
        LocalDate lastOrderDate = saleRepository.findLastSaleDateByCustomerId(customerId);

        // Recent performance
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = saleRepository.countByCustomerIdAndDateRange(customerId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = saleRepository.sumRevenueByCustomerIdAndDateRange(customerId, thirtyDaysAgo, today);

        // Yearly performance
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(),1,1);
        Integer yearlySalesCount = saleRepository.countByCustomerIdAndDateRange(customerId,yearStart,today);
        BigDecimal yearlySalesRevenue = saleRepository.sumRevenueByCustomerIdAndDateRange(customerId,yearStart,today);

        return new CustomerAnalyticsDTO(
                totalRevenue,
                totalSales,
                averageOrderValue,
                lastOrderDate,
                recentSalesCount,
                recentRevenue,
                yearlySalesCount,
                yearlySalesRevenue
        );
    }

    private CustomerAnalyticsDTO createEmptyCustomerAnalytics() {
        return new CustomerAnalyticsDTO(
                BigDecimal.ZERO,
                0,
                BigDecimal.ZERO,
                null,
                0,
                BigDecimal.ZERO,
                0,
                BigDecimal.ZERO
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<Customer> getSpecsFromFilters(CustomerFilters filters) {
        return Specification
                .where(CustomerSpecification.customerStringFieldLike("email",
                        filters.getEmail()))
                .and(CustomerSpecification.customerStringFieldLike("lastname"
                        ,filters.getLastname()))
                .and(CustomerSpecification.customerStringFieldLike("tin",
                        filters.getTin()))
                .and(CustomerSpecification.customerStringFieldLike(
                        "phone_number", filters.getPhoneNumber()))
                .and(CustomerSpecification.searchMultipleFields(filters.getSearchTerm()))
                .and(CustomerSpecification.wholeSaleCustomersOnly(filters.getWholesaleOnly()))
                .and(CustomerSpecification.customerIsActive(filters.getIsActive()));
    }

}
