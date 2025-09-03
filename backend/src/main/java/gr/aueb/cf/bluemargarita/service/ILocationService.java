package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.location.LocationDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationInsertDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationUpdateDTO;

import java.util.List;

/**
 * Service interface for managing locations in the jewelry business application.
 * Handles location CRUD operations, filtering, and performance-optimized sales analytics.
 *
 * Locations represent physical or virtual points of sale where transactions occur.
 * Each location tracks essential sales performance metrics efficiently using database-level
 * calculations to ensure fast response times even with large datasets.
 */
public interface ILocationService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new location with unique name validation
     *
     * Business Logic:
     * 1. Validates location name uniqueness
     * 2. Validates creator user exists
     * 3. Sets location as active by default
     * 4. Records creation audit information
     *
     * @param dto Location creation data containing name and creator user ID
     * @return Created location as read-only DTO
     * @throws EntityAlreadyExistsException if location name already exists
     * @throws EntityNotFoundException if creator user not found
     */
    LocationReadOnlyDTO createLocation(LocationInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing location's information
     *
     * Business Logic:
     * 1. Validates location exists
     * 2. Validates name uniqueness if name is being changed
     * 3. Validates updater user exists
     * 4. Updates location information and audit data
     *
     * @param dto Location update data containing ID, new name, and updater user ID
     * @return Updated location as read-only DTO
     * @throws EntityAlreadyExistsException if new name conflicts with existing location
     * @throws EntityNotFoundException if location or updater user not found
     */
    LocationReadOnlyDTO updateLocation(LocationUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a location with smart deletion strategy
     *
     * Business Logic:
     * - SOFT DELETE: If location has sales history (sets isActive=false, deletedAt=now)
     * - HARD DELETE: If location has no sales (removes from database)
     *
     * Performance Note: Uses count query instead of loading all sales for efficiency
     *
     * @param id Location ID to delete
     * @throws EntityNotFoundException if location not found
     */
    void deleteLocation(Long id) throws EntityNotFoundException;

    /**
     * Restores a soft-deleted location by making it active again
     * Business Logic:
     * 1. Validates location exists and is currently soft-deleted (isActive=false)
     * 2. Sets isActive=true and deletedAt=null
     * 3. Updates audit fields with current user and timestamp
     *
     * @param id Location ID to restore
     * @return Restored location as DTO
     * @throws EntityNotFoundException if location not found
     * @throws IllegalStateException if location is already active
     */
    LocationReadOnlyDTO restoreLocation(Long id) throws EntityNotFoundException, EntityInvalidArgumentException;

    /**
     * Retrieves a location by ID with basic information
     *
     * @param id Location ID
     * @return Location as read-only DTO with basic information
     * @throws EntityNotFoundException if location not found
     */
    LocationReadOnlyDTO getLocationById(Long id) throws EntityNotFoundException;

    // =============================================================================
    // VIEW LOCATIONS PAGE
    // =============================================================================

    /**
     * Retrieves locations with pagination and filtering for management pages
     *
     * Primary method for location management list views with:
     * - Name-based search (case-insensitive partial matching)
     * - Active/inactive status filtering
     * - Pagination support with configurable page size
     * - Sorting capabilities
     *
     * @param filters Filter criteria including pagination parameters
     * @return Paginated result of locations matching filter criteria
     */
    Paginated<LocationReadOnlyDTO> getLocationsFilteredPaginated(LocationFilters filters);

    /**
     * Retrieves comprehensive sales analytics for a specific location with optimal performance
     *
     * Used for "View Details" functionality in location management page, providing essential metrics:
     *
     * **All-Time Performance:**
     * - Total sales count and revenue since location creation
     * - Average order value calculation
     * - First and last sale dates for activity timeline
     *
     * **Recent Performance (Last 30 Days):**
     * - Sales count and revenue for trend analysis
     * - Helps identify current location performance
     *
     * **Current Year Performance:**
     * - Year-to-date sales count and revenue
     * - Useful for annual performance tracking and goals
     * @param id Location ID to analyze
     * @return Detailed location information with comprehensive but efficiently calculated analytics
     * @throws EntityNotFoundException if location not found
     */
    LocationDetailedViewDTO getLocationDetailedById(Long id) throws EntityNotFoundException;


    // =============================================================================
    // RECORD SALE PAGE - DROPDOWN LIST
    // =============================================================================

    /**
     * Retrieves active locations formatted for dropdown selections
     * Returns minimal data optimized for form dropdowns and autocomplete components
     * Results are sorted alphabetically by name for better user experience
     *
     * @return List of active locations with ID and name only, sorted alphabetically
     */
    List<LocationForDropdownDTO> getActiveLocationsForDropdown();


    /**
     * Retrieves inactive locations formatted for dropdown selections
     * Returns minimal data optimized for form dropdowns and autocomplete components
     * Results are sorted alphabetically by name for better user experience
     *
     * @return List of inactive locations with ID and name only, sorted alphabetically
     */
    List<LocationForDropdownDTO> getInactiveLocations();


}
