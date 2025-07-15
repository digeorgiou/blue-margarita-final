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

        if (!customer.getAllSales().isEmpty()) {
            // Soft Delete if customer is used in any sales
            customer.setIsActive(false);
            customer.setDeletedAt(LocalDateTime.now());
            customerRepository.save(customer);

            LOGGER.info("Customer {} soft deleted. Used in {} sales", customer.getFullName(), customer.getAllSales().size());
        } else {
            // Hard delete if customer not used anywhere
            customerRepository.delete(customer);
            LOGGER.info("Customer {} hard deleted (not used in any sales)", customer.getFullName());
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

        List<ProductStatsSummaryDTO> topProducts = calculateTopProductsForCustomer(customer);

        CustomerSalesDataDTO data = calculateCustomerSalesData(customer);

        return mapper.mapToCustomerDetailedViewDTO(customer, data, topProducts);
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

    private boolean emailExists(String email) {
        return email != null && !email.trim().isEmpty() && customerRepository.existsByEmail(email.trim());
    }

    private boolean tinExists(String tin) {
        return tin != null && !tin.trim().isEmpty() && customerRepository.existsByTin(tin.trim());
    }

    private int getActiveCustomerCount() {
        return (int) customerRepository.countByIsActiveTrue();
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Customer Analytics and Calculations
    // =============================================================================

    /**
     * Calculates comprehensive sales data for a customer
     */
    private CustomerSalesDataDTO calculateCustomerSalesData(Customer customer) {
        return new CustomerSalesDataDTO(
                getCustomerTotalRevenue(customer),
                getCustomerTotalNumberOfSales(customer),
                getCustomerLastOrderDate(customer),
                getAverageOrderValue(customer)
        );
    }

    /**
     * Calculates total revenue for a customer across all sales
     */
    private BigDecimal getCustomerTotalRevenue(Customer customer){

        return customer.getAllSales().stream()
                .map(Sale::getFinalTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Gets total number of sales for a customer
     */
    private int getCustomerTotalNumberOfSales(Customer customer){

        return customer.getAllSales().size();
    }

    /**
     * Gets the most recent order date for a customer
     */
    private LocalDate getCustomerLastOrderDate(Customer customer){

        return customer.getAllSales().stream()
                .map(Sale::getSaleDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElse(null);
    }

    /**
     * Calculates average order value for a customer
     */
    private BigDecimal getAverageOrderValue(Customer customer) {

        int numberOfSales = getCustomerTotalNumberOfSales(customer);
        BigDecimal totalRevenue = getCustomerTotalRevenue(customer);
        BigDecimal average = BigDecimal.ZERO;

        if(numberOfSales > 0 && totalRevenue.compareTo(BigDecimal.ZERO) > 0){
            average = totalRevenue.divide(BigDecimal.valueOf(numberOfSales), 2, BigDecimal.ROUND_HALF_UP);
        }
        return average;
    }

    /**
     * Calculates top 5 products purchased by a customer ordered by revenue
     */
    private List<ProductStatsSummaryDTO> calculateTopProductsForCustomer(Customer customer) {
        Map<Long, BigDecimal[]> productData = new HashMap<>(); // [quantity, revenue, lastSaleTimestamp]
        Map<Long, String[]> productInfo = new HashMap<>(); // [name, code]

        // Simple loop through all sales and products
        for (Sale sale : customer.getAllSales()) {
            long saleTimestamp = sale.getSaleDate().toEpochDay(); // Convert date to number for comparison

            for (SaleProduct saleProduct : sale.getAllSaleProducts()) {
                Long productId = saleProduct.getProduct().getId();

                // Store product info (name, code) - only once
                if (!productInfo.containsKey(productId)) {
                    productInfo.put(productId, new String[]{
                            saleProduct.getProduct().getName(),
                            saleProduct.getProduct().getCode()
                    });
                }

                // Get existing data or create new [quantity, revenue, lastSaleTimestamp]
                BigDecimal[] data = productData.getOrDefault(productId,
                        new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.valueOf(0)});

                // Add quantity
                data[0] = data[0].add(saleProduct.getQuantity());

                // Add revenue (quantity * price)
                BigDecimal revenue = saleProduct.getQuantity().multiply(saleProduct.getPriceAtTheTime());
                data[1] = data[1].add(revenue);

                // Update last sale date if newer
                if (saleTimestamp > data[2].longValue()) {
                    data[2] = BigDecimal.valueOf(saleTimestamp);
                }

                productData.put(productId, data);
            }
        }

        // Convert to DTOs and sort by revenue
        List<ProductStatsSummaryDTO> result = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal[]> entry : productData.entrySet()) {
            Long productId = entry.getKey();
            BigDecimal[] data = entry.getValue();
            String[] info = productInfo.get(productId);

            // Convert timestamp back to LocalDate
            LocalDate lastSaleDate = LocalDate.ofEpochDay(data[2].longValue());

            result.add(new ProductStatsSummaryDTO(
                    productId,
                    info[0], // name
                    info[1], // code
                    data[0], // total quantity
                    data[1], // total revenue
                    lastSaleDate
            ));
        }

        // Sort by revenue (highest first) and limit to top 5
        result.sort((a, b) -> b.totalRevenue().compareTo(a.totalRevenue()));

        return result.size() > 5 ? result.subList(0, 5) : result;
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
