package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.dto.material.MaterialSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.RecordPurchaseRequestDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierSearchResultDTO;
import gr.aueb.cf.bluemargarita.service.IMaterialService;
import gr.aueb.cf.bluemargarita.service.IPurchaseService;
import gr.aueb.cf.bluemargarita.service.ISupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/record-purchase")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Record Purchase", description = "APIs for the Record Purchase page workflow including form data, supplier and material search, and purchase recording")
public class RecordPurchaseRestController {

    private final IPurchaseService purchaseService;
    private final ISupplierService supplierService;
    private final IMaterialService materialService;

    // =============================================================================
    // PAGE INITIALIZATION - LOAD ALL FORM DATA
    // =============================================================================

    @Operation(
            summary = "Get Record Purchase page initialization data",
            description = "Retrieves all necessary data for the Record Purchase page in a single request: suppliers dropdown and initial form setup data. Optimized for page load.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete Record Purchase page initialization data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/init")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getRecordPurchasePageData() {
        Map<String, Object> pageData = new HashMap<>();

        // Form dropdown data
        pageData.put("suppliers", supplierService.getActiveSuppliersForDropdown());

        return new ResponseEntity<>(pageData, HttpStatus.OK);
    }

    // =============================================================================
    // SUPPLIER SEARCH - AUTOCOMPLETE FUNCTIONALITY
    // =============================================================================

    @Operation(
            summary = "Search suppliers for autocomplete",
            description = "Searches suppliers for autocomplete functionality in Record Purchase page. Returns suppliers matching name, email, or phone. Alternative to dropdown selection.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of suppliers matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/suppliers/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<SupplierSearchResultDTO>> searchSuppliers(
            @Parameter(description = "Search term (name, email, or phone)", required = true)
            @RequestParam String searchTerm) {

        List<SupplierSearchResultDTO> suppliers = supplierService.searchSuppliersForAutocomplete(searchTerm);
        return new ResponseEntity<>(suppliers, HttpStatus.OK);
    }

    // =============================================================================
    // MATERIAL SEARCH - FOR ADDING TO PURCHASE
    // =============================================================================

    @Operation(
            summary = "Search materials for autocomplete",
            description = "Searches materials for autocomplete functionality when adding materials to purchase. Returns materials matching name for easy selection.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of materials matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/materials/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<MaterialSearchResultDTO>> searchMaterials(
            @Parameter(description = "Search term (material name)", required = true)
            @RequestParam String searchTerm) {

        List<MaterialSearchResultDTO> materials = materialService.searchMaterialsForAutocomplete(searchTerm);
        return new ResponseEntity<>(materials, HttpStatus.OK);
    }

    // =============================================================================
    // PURCHASE RECORDING - FINAL STEP
    // =============================================================================

    @Operation(
            summary = "Record a new purchase",
            description = "Records the complete purchase with all materials and supplier information. Automatically calculates total cost based on material quantities and current prices. Final step in Record Purchase workflow.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Purchase recorded successfully with complete details",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PurchaseDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid purchase data or validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Supplier, user, or material not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PurchaseDetailedViewDTO> recordPurchase(
            @Valid @RequestBody RecordPurchaseRequestDTO request,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        PurchaseDetailedViewDTO purchase = purchaseService.recordPurchase(request);
        return new ResponseEntity<>(purchase, HttpStatus.CREATED);
    }

    // =============================================================================
    // FORM HELPER ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get active suppliers for dropdown",
            description = "Retrieves all active suppliers formatted for dropdown selection. Used for supplier selection in Record Purchase form.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of active suppliers for dropdown",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierDropdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/suppliers")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<SupplierDropdownDTO>> getActiveSuppliers() {
        List<SupplierDropdownDTO> suppliers = supplierService.getActiveSuppliersForDropdown();
        return new ResponseEntity<>(suppliers, HttpStatus.OK);
    }
}
