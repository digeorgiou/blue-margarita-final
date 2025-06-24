package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerInsertDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerWithSalesDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.CustomerRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
    public Page<CustomerReadOnlyDTO> searchCustomers(String searchTerm, Pageable pageable) {
        return null;
    }

    @Override
    public Page<CustomerReadOnlyDTO> getCustomersByGender(GenderType gender, Pageable pageable) {
        return null;
    }

    @Override
    public Page<CustomerReadOnlyDTO> getCustomersByActiveStatus(Boolean isActive, Pageable pageable) {
        return null;
    }

    @Override
    public Page<CustomerReadOnlyDTO> searchAndFilterCustomers(String searchTerm, GenderType gender, Boolean isActive, Pageable pageable) {
        return null;
    }

    @Override
    public Long getTotalCustomerCount() {
        return 0;
    }

    @Override
    public Long getActiveCustomerCount() {
        return 0;
    }

    @Override
    public Long getNewCustomersThisMonth() {
        return 0;
    }

    @Override
    public Long getCustomersWithOrdersCount() {
        return 0;
    }

    @Override
    public CustomerWithSalesDTO getCustomerWithSales(Long customerId) {
        return null;
    }

    @Override
    public Page<CustomerWithSalesDTO> getCustomersWithSalesStats(Pageable pageable) {
        return null;
    }
}
