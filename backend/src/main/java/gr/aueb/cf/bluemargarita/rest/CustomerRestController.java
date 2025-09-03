package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.CustomerFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.category.CategoryReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.customer.*;
import gr.aueb.cf.bluemargarita.service.CustomerService;
import gr.aueb.cf.bluemargarita.service.ICustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Customer Management", description = "APIs for managing customers in the jewelry business")
public class CustomerRestController {

    private final ICustomerService customerService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR CUSTOMER MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new customer",
            description = "Creates a new customer with unique email and TIN validation. Requires authentication.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Customer created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Customer with email or TIN already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerListItemDTO> createCustomer(
            @Valid @RequestBody CustomerInsertDTO customerInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        // ErrorHandler will catch this and return 400 with field errors
        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        // ErrorHandler will catch service exceptions and return appropriate status codes
        CustomerListItemDTO customerListItemDTO = customerService.createCustomer(customerInsertDTO);
        return new ResponseEntity<>(customerListItemDTO, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update customer",
            description = "Updates an existing customer's information. Requires authentication.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Customer updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Customer not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Email or TIN conflicts with existing customer",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerListItemDTO> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerUpdateDTO customerUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException,
            EntityNotFoundException, EntityInvalidArgumentException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        // Ensure the ID in the path matches the ID in the DTO
        if (!id.equals(customerUpdateDTO.customerId())) {
            throw new EntityInvalidArgumentException("User","Path ID does not match DTO customer ID");
        }

        CustomerListItemDTO customerListItemDTO = customerService.updateCustomer(customerUpdateDTO);
        return new ResponseEntity<>(customerListItemDTO, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete customer",
            description = "Deletes a customer. Performs soft delete if customer has sales history, hard delete otherwise.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Customer deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "403",
                            description = "Access denied - requires ADMIN role",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Customer not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) throws EntityNotFoundException {
        customerService.deleteCustomer(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Restore a soft-deleted customer",
            description = "Restores a soft-deleted customer by making it active again. Only accessible by admins.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Customer restored successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerListItemDTO.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Customer not found"
                    ),
                    @ApiResponse(responseCode = "400", description = "Customer is already active"
                    ),
                    @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"
                    )
            }
    )

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerListItemDTO > restoreCustomer(@PathVariable Long id) throws EntityNotFoundException, EntityInvalidArgumentException{

        CustomerListItemDTO restoredCustomer = customerService.restoreCustomer(id);
        return ResponseEntity.ok(restoredCustomer);
    }


    @Operation(
            summary = "Get customer by ID",
            description = "Retrieves a customer by their ID. Returns detailed customer information.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Customer found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Customer not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerDetailedViewDTO> getCustomerById(@PathVariable Long id) throws EntityNotFoundException {
        CustomerDetailedViewDTO customerDetailedViewDTO = customerService.getCustomerDetailedView(id);
        return new ResponseEntity<>(customerDetailedViewDTO, HttpStatus.OK);
    }


    // =============================================================================
    // CUSTOMER VIEWING AND DETAILS - FOR CUSTOMER MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get customers with pagination and filters",
            description = "Retrieves customers with pagination and filtering support. Main endpoint for customer management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of customers",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<CustomerListItemDTO>> getCustomersFilteredPaginated(
            @Parameter(description = "Customer email filter") @RequestParam(required = false) String email,
            @Parameter(description = "Customer lastname filter") @RequestParam(required = false) String lastname,
            @Parameter(description = "Customer TIN filter") @RequestParam(required = false) String tin,
            @Parameter(description = "Customer phone number filter") @RequestParam(required = false) String phoneNumber,
            @Parameter(description = "General search term (searches multiple fields)") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "Filter wholesale customers only") @RequestParam(required = false) Boolean wholesaleOnly,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "lastname") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        CustomerFilters filters = CustomerFilters.builder()
                .email(email)
                .lastname(lastname)
                .tin(tin)
                .phoneNumber(phoneNumber)
                .searchTerm(searchTerm)
                .wholesaleOnly(wholesaleOnly)
                .isActive(isActive)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<CustomerListItemDTO> customers = customerService.getCustomersFilteredPaginated(filters);
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    @Operation(
            summary = "Get customer detailed view",
            description = "Retrieves comprehensive customer information including sales analytics and top products. Used for customer detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Customer detailed view with analytics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Customer not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerDetailedViewDTO> getCustomerDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        CustomerDetailedViewDTO customerDetails = customerService.getCustomerDetailedView(id);
        return new ResponseEntity<>(customerDetails, HttpStatus.OK);
    }

    // =============================================================================
    // CUSTOMER SEARCH - FOR RECORD SALE PAGE
    // =============================================================================

    @Operation(
            summary = "Search customers for autocomplete",
            description = "Searches customers for autocomplete functionality in sales recording. Returns limited results for performance. Used in Record Sale page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of customers matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<CustomerSearchResultDTO>> searchCustomersForAutocomplete(
            @Parameter(description = "Search term (name, email, or phone)", required = true)
            @RequestParam String searchTerm) {

        List<CustomerSearchResultDTO> customers = customerService.searchCustomersForAutocomplete(searchTerm);
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

}
