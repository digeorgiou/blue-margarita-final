package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.location.LocationInsertDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationUpdateDTO;

import java.util.List;

/**
 * Service interface for managing locations in the jewelry business application.
 * Handles location CRUD operations, validation, and filtering.
 */
public interface ILocationService {

    // Core CRUD Operations

    /**
     * Creates a new location with unique name validation
     * @param dto Location creation data
     * @return Created location as DTO
     * @throws EntityAlreadyExistsException if location name already exists
     * @throws EntityNotFoundException if creator user not found
     */
    LocationReadOnlyDTO createLocation(LocationInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing location's information
     * @param dto Location update data
     * @return Updated location as DTO
     * @throws EntityAlreadyExistsException if new name conflicts with existing location
     * @throws EntityNotFoundException if location or updater user not found
     */
    LocationReadOnlyDTO updateLocation(LocationUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a location. Performs soft delete if location is used in sales, hard delete otherwise
     * @param id Location ID to delete
     * @throws EntityNotFoundException if location not found
     */
    void deleteLocation(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a location by ID
     * @param id Location ID
     * @return Location as DTO
     * @throws EntityNotFoundException if location not found
     */
    LocationReadOnlyDTO getLocationById(Long id) throws EntityNotFoundException;

    // Query Operations

    /**
     * Retrieves all locations (active and inactive)
     * @return List of all locations
     */
    List<LocationReadOnlyDTO> getAllLocations();

    /**
     * Retrieves all active locations only
     * @return List of active locations
     */
    List<LocationReadOnlyDTO> getAllActiveLocations();

    /**
     * Checks if a location name already exists
     * @param name Location name to check
     * @return true if name exists, false otherwise
     */
    boolean nameExists(String name);

    /**
     * Retrieves locations based on filter criteria
     * @param filters Filter criteria for locations
     * @return List of locations matching filters
     */
    List<LocationReadOnlyDTO> getFilteredLocations(LocationFilters filters);

    /**
     * Retrieves locations with pagination based on filter criteria
     * @param filters Filter criteria including pagination info
     * @return Paginated result of locations matching filters
     */
    Paginated<LocationReadOnlyDTO> getLocationsFilteredPaginated(LocationFilters filters);
}
