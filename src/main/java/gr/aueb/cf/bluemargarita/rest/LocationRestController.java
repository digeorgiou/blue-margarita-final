package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.location.*;
import gr.aueb.cf.bluemargarita.service.ILocationService;
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
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Location Management", description = "APIs for managing business locations in the jewelry business")
public class LocationRestController {

    private final ILocationService locationService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR LOCATION MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new location",
            description = "Creates a new business location with unique name validation. Used in location management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Location created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Location with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<LocationReadOnlyDTO> createLocation(
            @Valid @RequestBody LocationInsertDTO locationInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        LocationReadOnlyDTO location = locationService.createLocation(locationInsertDTO);
        return new ResponseEntity<>(location, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update location",
            description = "Updates an existing location's information with unique name validation. Used in location management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Location updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Location not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Location with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<LocationReadOnlyDTO> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationUpdateDTO locationUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        LocationReadOnlyDTO location = locationService.updateLocation(locationUpdateDTO);
        return new ResponseEntity<>(location, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete location",
            description = "Deletes a location. Performs soft delete if location has sales history, hard delete otherwise. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Location deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Location not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) throws EntityNotFoundException {
        locationService.deleteLocation(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get location basic info by ID",
            description = "Retrieves basic location information by ID. Used for editing forms and quick lookups.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Location found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Location not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<LocationReadOnlyDTO> getLocationById(@PathVariable Long id) throws EntityNotFoundException {
        LocationReadOnlyDTO location = locationService.getLocationById(id);
        return new ResponseEntity<>(location, HttpStatus.OK);
    }

    // =============================================================================
    // LOCATION VIEWING AND LISTING - FOR LOCATION MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get locations with pagination and filters",
            description = "Retrieves locations with pagination and filtering support. Main endpoint for location management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of locations",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<LocationReadOnlyDTO>> getLocationsFilteredPaginated(
            @Parameter(description = "Location name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        LocationFilters filters = LocationFilters.builder()
                .name(name)
                .isActive(isActive)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<LocationReadOnlyDTO> locations = locationService.getLocationsFilteredPaginated(filters);
        return new ResponseEntity<>(locations, HttpStatus.OK);
    }

    // =============================================================================
    // DROPDOWN AND SELECTION ENDPOINTS - FOR SALES AND OTHER FORMS
    // =============================================================================

    @Operation(
            summary = "Get locations for dropdown",
            description = "Retrieves active locations formatted for dropdown selection with ID and name only. Used in sales recording and other forms.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of locations for dropdown",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationForDropdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/dropdown")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LocationForDropdownDTO>> getLocationsForDropdown() {
        List<LocationForDropdownDTO> locations = locationService.getActiveLocationsForDropdown();
        return new ResponseEntity<>(locations, HttpStatus.OK);
    }

    // =============================================================================
    // CONVENIENCE ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get all active locations",
            description = "Retrieves all active locations without pagination. Used for simple listings and exports.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of all active locations",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationReadOnlyDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LocationReadOnlyDTO>> getAllActiveLocations() {
        List<LocationReadOnlyDTO> locations = locationService.getAllActiveLocations();
        return new ResponseEntity<>(locations, HttpStatus.OK);
    }

    @Operation(
            summary = "Get all locations",
            description = "Retrieves all locations (active and inactive) for administrative purposes. Used for comprehensive location management views.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of all locations",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationReadOnlyDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LocationReadOnlyDTO>> getAllLocations() {
        List<LocationReadOnlyDTO> locations = locationService.getAllLocations();
        return new ResponseEntity<>(locations, HttpStatus.OK);
    }
}
