package gr.aueb.cf.bluemargarita.service;
import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerInsertDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerWithSalesDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICustomerService {
    CustomerReadOnlyDTO createCustomer(CustomerInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    CustomerReadOnlyDTO updateCustomer(CustomerUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    void deleteCustomer(Long id) throws EntityNotFoundException;
    CustomerReadOnlyDTO getCustomerById(Long id) throws EntityNotFoundException;
    Page<CustomerReadOnlyDTO> getPaginatedCustomers(int page, int size);
    Page<CustomerReadOnlyDTO> getPaginatedSortedCustomers(int page,int size,
                                                          String sortBy, String sortDirection);
//    // Search customers by various criteria
//    Page<CustomerReadOnlyDTO> searchCustomers(String searchTerm, Pageable pageable);
//    // Filter by gender
//    Page<CustomerReadOnlyDTO> getCustomersByGender(GenderType gender, Pageable pageable);
//    // Filter by active status
//    Page<CustomerReadOnlyDTO> getCustomersByActiveStatus(Boolean isActive, Pageable pageable);
//    // Combined search and filter
//    Page<CustomerReadOnlyDTO> searchAndFilterCustomers(
//            String searchTerm,
//            GenderType gender,
//            Boolean isActive,
//            Pageable pageable
//    );
//
//    //Statistics
//
//    // Get total customer count
//    Long getTotalCustomerCount();
//
//    // Get active customers count
//    Long getActiveCustomerCount();
//
//    // Get new customers this month
//    Long getNewCustomersThisMonth();
//
//    // Get customers with orders
//    Long getCustomersWithOrdersCount();
//
//    // Get customer with sales summary
//    CustomerWithSalesDTO getCustomerWithSales(Long customerId);
//
//    // Get customers with sales statistics
//    Page<CustomerWithSalesDTO> getCustomersWithSalesStats(Pageable pageable);
}
