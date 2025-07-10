package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.CustomerFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.CustomerSpecification;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerInsertDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerWithSalesDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.Sale;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.CustomerRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerReadOnlyDTO createCustomer(CustomerInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

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

        return mapper.mapToCustomerReadOnlyDTO(insertedCustomer);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomerReadOnlyDTO updateCustomer(CustomerUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

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

        return mapper.mapToCustomerReadOnlyDTO(savedCustomer);
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

    @Override
    @Transactional(readOnly = true)
    public CustomerReadOnlyDTO getCustomerById(Long id) throws EntityNotFoundException {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id=" + id + " was not found"));

        return mapper.mapToCustomerReadOnlyDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerReadOnlyDTO> getPaginatedCustomers(int page, int size){

        String defaultSort = "id";

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(defaultSort).ascending());

        return customerRepository.findAll(pageable).map(mapper::mapToCustomerReadOnlyDTO);

    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerReadOnlyDTO> getPaginatedSortedCustomers(int page,
                                                                 int size,
                                                                 String sortBy, String sortDirection){

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return customerRepository.findAll(pageable).map(mapper::mapToCustomerReadOnlyDTO);

    }

    public List<CustomerReadOnlyDTO> getFilteredCustomers(CustomerFilters filters){
        return customerRepository.findAll(getSpecsFromFilters(filters)).stream()
                .map(mapper::mapToCustomerReadOnlyDTO).collect(Collectors.toList());
    }

    public Paginated<CustomerReadOnlyDTO> getCustomersFilteredPaginated(CustomerFilters filters){

        var filtered =
                customerRepository.findAll(getSpecsFromFilters(filters),
                        filters.getPageable());

        return new Paginated<>(filtered.map(mapper::mapToCustomerReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<CustomerReadOnlyDTO> searchCustomersPaginated(String searchTerm, Pageable pageable) {
        Specification<Customer> spec = Specification
                .where(CustomerSpecification.customerIsActive(true))
                .and(CustomerSpecification.searchByTerm(searchTerm));

        var searchResults = customerRepository.findAll(spec, pageable);
        return new Paginated<>(searchResults.map(mapper::mapToCustomerReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCustomerTotalRevenue(Long customerId) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(customerId);

        return customer.getAllSales().stream()
                .map(Sale::getFinalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int getCustomerTotalNumberOfSales(Long customerId) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(customerId);

        return customer.getAllSales().size();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCustomerRevenueByDateRange(Long customerId, LocalDate startDate, LocalDate endDate) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(customerId);

        return customer.getAllSales().stream()
                .filter(sale -> sale.getSaleDate() != null)
                .filter(sale -> !sale.getSaleDate().isBefore(startDate))
                .filter(sale -> !sale.getSaleDate().isAfter(endDate))
                .map(Sale::getFinalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public int getCustomerNumberOfSalesByDateRange(Long customerId, LocalDate startDate, LocalDate endDate) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(customerId);

        return  (int) customer.getAllSales().stream()
                .filter(sale -> sale.getSaleDate() != null)
                .filter(sale -> !sale.getSaleDate().isBefore(startDate))
                .filter(sale -> !sale.getSaleDate().isAfter(endDate))
                .count();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerWithSalesDTO getCustomerWithSalesAnalytics(Long customerId) throws EntityNotFoundException {

        Customer customer = getCustomerEntityById(customerId);

        return mapper.mapToCustomerWithSalesDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerReadOnlyDTO> getAllActiveCustomers() {
        return customerRepository.findByIsActiveTrue()
                .stream()
                .map(mapper::mapToCustomerReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerReadOnlyDTO getCustomerByEmail(String email) throws EntityNotFoundException {
        if (email == null || email.trim().isEmpty()) {
            throw new EntityNotFoundException("Customer", "Email cannot be null or empty");
        }

        Customer customer = customerRepository.findByEmail(email.trim())
                .orElseThrow(() -> new EntityNotFoundException("Customer",
                        "Customer with email=" + email + " was not found"));

        return mapper.mapToCustomerReadOnlyDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerReadOnlyDTO getCustomerByTin(String tin) throws EntityNotFoundException {
        if (tin == null || tin.trim().isEmpty()) {
            throw new EntityNotFoundException("Customer", "TIN cannot be null or empty");
        }

        Customer customer = customerRepository.findByTin(tin.trim())
                .orElseThrow(() -> new EntityNotFoundException("Customer",
                        "Customer with TIN=" + tin + " was not found"));

        return mapper.mapToCustomerReadOnlyDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerReadOnlyDTO> getTopCustomersByRevenueByDateRange(int limit, LocalDate startDate, LocalDate endDate) {
        if (limit <= 0) {
            return List.of();
        }

        Specification<Customer> spec = CustomerSpecification.withSalesInDateRangeForRevenue(startDate, endDate);
        Pageable pageable = PageRequest.of(0, limit);

        return customerRepository.findAll(spec, pageable)
                .stream()
                .map(mapper::mapToCustomerReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerReadOnlyDTO> getTopCustomersByOrderCountByDateRange(int limit, LocalDate startDate, LocalDate endDate) {
        if (limit <= 0) {
            return List.of();
        }

        Specification<Customer> spec = CustomerSpecification.withSalesInDateRangeForOrderCount(startDate, endDate);
        Pageable pageable = PageRequest.of(0, limit);

        return customerRepository.findAll(spec, pageable)
                .stream()
                .map(mapper::mapToCustomerReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<CustomerReadOnlyDTO> getNewCustomersInPeriod(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        Specification<Customer> spec = Specification
                .where(CustomerSpecification.customerIsActive(true))
                .and(CustomerSpecification.firstSaleInDateRange(startDate, endDate));

        var searchResults = customerRepository.findAll(spec, pageable);
        return new Paginated<>(searchResults.map(mapper::mapToCustomerReadOnlyDTO));
    }

    @Override
    public boolean emailExists(String email) {
        return email != null && !email.trim().isEmpty() && customerRepository.existsByEmail(email.trim());
    }

    @Override
    public boolean tinExists(String tin) {
        return tin != null && !tin.trim().isEmpty() && customerRepository.existsByTin(tin.trim());
    }

    @Override
    public int getActiveCustomerCount() {
        return (int) customerRepository.countByIsActiveTrue();
    }

    @Override
    public int getNewCustomerCount(LocalDate startDate, LocalDate endDate) {
        Specification<Customer> spec = Specification
                .where(CustomerSpecification.customerIsActive(true))
                .and(CustomerSpecification.firstSaleInDateRange(startDate, endDate));

        return (int) customerRepository.count(spec);
    }

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
                .and(CustomerSpecification.customerIsActive(filters.getIsActive()));
    }

    private Customer getCustomerEntityById(Long id) throws EntityNotFoundException{
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id=" + id + " was not found"));
    }


}
