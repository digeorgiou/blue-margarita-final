package gr.aueb.cf.bluemargarita.rest;

//import gr.aueb.cf.bluemargarita.core.exceptions.*;
//import gr.aueb.cf.bluemargarita.core.filters.CustomerFilters;
//import gr.aueb.cf.bluemargarita.core.filters.Paginated;
//import gr.aueb.cf.bluemargarita.dto.customer.CustomerInsertDTO;
//import gr.aueb.cf.bluemargarita.dto.customer.CustomerReadOnlyDTO;
//import gr.aueb.cf.bluemargarita.mapper.Mapper;
//import gr.aueb.cf.bluemargarita.service.CustomerService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.media.Content;
//import io.swagger.v3.oas.annotations.media.Schema;
//import io.swagger.v3.oas.annotations.responses.ApiResponse;
//import io.swagger.v3.oas.annotations.security.SecurityRequirement;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.lang.Nullable;
//import org.springframework.validation.BindingResult;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api")
//@RequiredArgsConstructor
//public class CustomerRestController {
//
//    private final CustomerService customerService;
//    private final Mapper mapper;
//
//    @Operation(
//            summary = "Save a customer",
//            responses = {
//                    @ApiResponse(
//                            responseCode = "200",
//                            description = "Customer inserted",
//                            content = @Content(
//                                    mediaType = "application/json",
//                                    schema = @Schema(implementation =
//                                            CustomerReadOnlyDTO.class)
//                            )
//                    ),
//                    @ApiResponse(
//                            responseCode = "400",
//                            description = "Validation errors",
//                            content = @Content(mediaType = "application/json")
//                    ),
//                    @ApiResponse(
//                            responseCode = "401",
//                            description = "Unauthorized",
//                            content = @Content
//                    ),
//                    @ApiResponse(
//                            responseCode = "409",
//                            description = "Customer already exists",
//                            content = @Content(mediaType = "application/json")
//                    )
//            }
//    )
//
//    @PostMapping("customers/save")
//    public ResponseEntity<CustomerReadOnlyDTO> saveCustomer(
//            @Valid @RequestBody CustomerInsertDTO customerInsertDTO,
//            BindingResult bindingResult
//            ) throws EntityNotFoundException, ValidationException,
//            EntityAlreadyExistsException {
//
//        if(bindingResult.hasErrors()){
//            throw new ValidationException(bindingResult);
//        }
//
//        CustomerReadOnlyDTO customerReadOnlyDTO =
//                customerService.createCustomer(customerInsertDTO);
//
//        return new ResponseEntity<>(customerReadOnlyDTO, HttpStatus.CREATED);
//
//    }
//
//    @Operation(
//            summary = "Get all customers paginated",
//            security = @SecurityRequirement(name = "Bearer Authentication"),
//            responses = {
//                    @ApiResponse(
//                            responseCode = "200",
//                            description = "Customer Found",
//                            content = @Content(
//                                    mediaType = "application/json",
//                                    schema = @Schema(implementation =
//                                            CustomerReadOnlyDTO.class)
//                            )
//
//                    ),
//                    @ApiResponse(
//                            responseCode = "401",
//                            description = "Unauthorized",
//                            content = @Content
//                    ),
//                    @ApiResponse(
//                            responseCode = "403",
//                            description = "Access Denied",
//                            content = @Content
//                    )
//            }
//    )
//
//    @GetMapping("/customers/paginated")
//    public ResponseEntity<Page<CustomerReadOnlyDTO>> getPaginatedCustomers(@RequestParam(defaultValue = "0") int page,
//                                                                           @RequestParam(defaultValue = "5") int size) {
//        Page<CustomerReadOnlyDTO> customersPage =
//                customerService.getPaginatedCustomers(page, size);
//
//        return new ResponseEntity<>(customersPage, HttpStatus.OK);
//    }
//
//    @PostMapping("/customers/filtered")
//    public ResponseEntity<List<CustomerReadOnlyDTO>> getFilteredCustomers(@Nullable @RequestBody CustomerFilters filters)
//        throws EntityNotAuthorizedException {
//        if(filters == null) filters= CustomerFilters.builder().build();
//        return ResponseEntity.ok(customerService.getFilteredCustomers(filters));
//    }
//
//    @PostMapping("customers/filtered/paginated")
//    public ResponseEntity<Paginated<CustomerReadOnlyDTO>> getFilteredPaginatedCustomers(@Nullable @RequestBody CustomerFilters filters)
//            throws EntityNotAuthorizedException {
//        if(filters == null) filters = CustomerFilters.builder().build();
//        return ResponseEntity.ok(customerService.getCustomersFilteredPaginated(filters));
//    }
//}
