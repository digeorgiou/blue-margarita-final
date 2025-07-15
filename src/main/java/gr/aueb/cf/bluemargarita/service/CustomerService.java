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
import gr.aueb.cf.bluemargarita.model.Sale;
import gr.aueb.cf.bluemargarita.model.SaleProduct;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.CustomerRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
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
    private final Mapper mapper;

    @Autowired
    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository, Mapper mapper) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerListItemDTO createCustomer(CustomerInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (dto.email() != null && customerRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("Customer", "Customer with email " + dto.email() + " already exists");
        }

        if (dto.tin() != null && customerRepository.existsByTin(dto.tin())) {
            throw new EntityAlreadyExistsException("Customer", "Customer with TIN " + dto.tin() + " already exists");
        }

        Customer customer = mapper.mapCustomerInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        customer.setCreatedBy(creator);
        customer.setLastUpdatedBy(creator);

        Customer insertedCustomer = customerRepository.save(customer);

        LOGGER.info("Customer created with id: {}", insertedCustomer.getId());

        return mapper.mapToCustomerListItemDTO(insertedCustomer);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerListItemDTO updateCustomer(CustomerUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Customer existingCustomer = customerRepository.findById(dto.customerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id=" + dto.customerId() + " was not found"));

        if (dto.email() != null && !dto.email().equals(existingCustomer.getEmail()) && customerRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("Customer", "Customer with email " + dto.email() + " already exists");
        }

        if (dto.tin() != null && !dto.tin().equals(existingCustomer.getTin()) && customerRepository.existsByTin(dto.tin())) {
            throw new EntityAlreadyExistsException("Customer", "Customer with TIN " + dto.tin() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Customer updatedCustomer = mapper.mapCustomerUpdateToModel(dto, existingCustomer);
        updatedCustomer.setLastUpdatedBy(updater);

        Customer savedCustomer = customerRepository.save(updatedCustomer);

        LOGGER.info("Customer {} updated by user {}", savedCustomer.getFullName(), updater.getUsername());

        return mapper.mapToCustomerListItemDTO(savedCustomer);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCustomer(Long id) throws EntityNotFoundException {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id=" + id + " was not found"));

        Integer salesCount = customerRepository.countSalesByCustomerId(id);

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

    // =============================================================================
    // CUSTOMER LISTING AND FILTERING
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public CustomerListItemDTO getCustomerById(Long id) throws EntityNotFoundException {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id=" + id + " was not found"));

        return mapper.mapToCustomerListItemDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<CustomerListItemDTO> getCustomersFilteredPaginated(CustomerFilters filters){

        var filtered =
                customerRepository.findAll(getSpecsFromFilters(filters),
                        filters.getPageable());

        return new Paginated<>(filtered.map(mapper::mapToCustomerListItemDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDetailedViewDTO getCustomerDetailedView(Long customerId) throws EntityNotFoundException{
        Customer customer = getCustomerEntityById(customerId);

        Integer totalSales = customerRepository.countSalesByCustomerId(customerId);
        if (totalSales == 0) {
            // No sales - return empty analytics
            CustomerSalesDataDTO emptySalesData = new CustomerSalesDataDTO(customerId, customer.getFullName(), customer.getEmail(), 0, BigDecimal.ZERO, 0, null);
            return mapper.mapToCustomerDetailedViewDTO(customer, emptySalesData, Collections.emptyList());
        }

        // Get aggregated sales data in single queries
        BigDecimal totalRevenue = customerRepository.sumRevenueByCustomerId(customerId);
        LocalDate lastOrderDate = customerRepository.findLastSaleDateByCustomerId(customerId);

        // Get top products using repository aggregation
        List<Object[]> topProductsData = customerRepository.findTopProductsByCustomerId(customerId);

        List<ProductStatsSummaryDTO> topProducts = topProductsData.stream()
                .map(data -> new ProductStatsSummaryDTO(
                        (Long) data[0],           // productId
                        (String) data[1],         // productName
                        (String) data[2],         // productCode
                        (BigDecimal) data[3],     // totalQuantity
                        (BigDecimal) data[4],     // totalRevenue
                        (LocalDate) data[5]       // lastSaleDate
                ))
                .collect(Collectors.toList());

        CustomerSalesDataDTO salesData = new CustomerSalesDataDTO(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                totalSales,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                totalSales,
                lastOrderDate
        );

        LOGGER.debug("Analytics completed for customer '{}': totalSales={}, totalRevenue={}, topProducts={}",
                customer.getFullName(), totalSales, totalRevenue, topProducts.size());

        return mapper.mapToCustomerDetailedViewDTO(customer, salesData, topProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerListItemDTO> getAllActiveCustomers() {
        return customerRepository.findByIsActiveTrue()
                .stream()
                .map(mapper::mapToCustomerListItemDTO)
                .collect(Collectors.toList());
    }

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


    private int getActiveCustomerCount() {
        return (int) customerRepository.countByIsActiveTrue();
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    /**
     * Converts CustomerFilters to JPA Specifications for database queries
     */

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
