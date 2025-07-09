package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.location.LocationInsertDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationUpdateDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ILocationService {

    LocationReadOnlyDTO createLocation(LocationInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    LocationReadOnlyDTO updateLocation(LocationUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    void deleteLocation(Long id) throws EntityNotFoundException;
    LocationReadOnlyDTO getLocationById(Long id) throws EntityNotFoundException;
    List<LocationReadOnlyDTO> getAllLocations();
    Page<LocationReadOnlyDTO> getAllLocationsPaginated(int page,
                                                       int size);
    boolean nameExists(String name);
    List<LocationReadOnlyDTO> getFilteredLocations(LocationFilters filters);
    Paginated<LocationReadOnlyDTO> getLocationsFilteredPaginated(LocationFilters filters);
}
