package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.LocationSpecification;
import gr.aueb.cf.bluemargarita.dto.location.LocationInsertDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Location;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.LocationRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService implements ILocationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LocationService.class);
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public LocationService(LocationRepository locationRepository, UserRepository userRepository, Mapper mapper) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LocationReadOnlyDTO createLocation(LocationInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (locationRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Location", "Location with" +
                    " description " + dto.name() + " already exists");
        }

        Location location = mapper.mapLocationInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        location.setCreatedBy(creator);
        location.setLastUpdatedBy(creator);

        Location insertedLocation = locationRepository.save(location);

        LOGGER.info("Location created with id: {}", insertedLocation.getId());

        return mapper.mapToLocationReadOnlyDTO(insertedLocation);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LocationReadOnlyDTO updateLocation(LocationUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Location existingLocation = locationRepository.findById(dto.locationId())
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id=" + dto.locationId() + " was not found"));

        if (!existingLocation.getName().equals(dto.name()) && locationRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Location", "Location with" +
                    " description " + dto.name() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Location updatedLocation = mapper.mapLocationUpdateToModel(dto, existingLocation);
        updatedLocation.setLastUpdatedBy(updater);

        Location savedLocation = locationRepository.save(updatedLocation);

        LOGGER.info("Location {} updated by user {}", savedLocation.getName(),
                updater.getUsername());

        return mapper.mapToLocationReadOnlyDTO(savedLocation);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteLocation(Long id) throws EntityNotFoundException {

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id=" + id + " was not found"));

        if (!location.getAllSales().isEmpty()) {
            // Soft Delete if location is used in any sales
            location.setIsActive(false);
            location.setDeletedAt(LocalDateTime.now());
            locationRepository.save(location);

            LOGGER.info("Location {} soft deleted. Used in {} sales",
                    location.getName(), location.getAllSales().size());
        } else {
            // Hard delete if location not used anywhere
            locationRepository.delete(location);
            LOGGER.info("Location {} hard deleted (not used in any sales)",
                    location.getName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public LocationReadOnlyDTO getLocationById(Long id) throws EntityNotFoundException {

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id=" + id + " was not found"));

        return mapper.mapToLocationReadOnlyDTO(location);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationReadOnlyDTO> getAllLocations() {

        List<Location> locations = locationRepository.findAll();

        return locations.stream()
                .map(mapper::mapToLocationReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationReadOnlyDTO> getAllActiveLocations() {

        List<Location> locations = locationRepository.findByIsActiveTrue();

        return locations.stream()
                .map(mapper::mapToLocationReadOnlyDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public boolean nameExists(String name){
        return locationRepository.existsByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationReadOnlyDTO> getFilteredLocations(LocationFilters filters) {
        return locationRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToLocationReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<LocationReadOnlyDTO> getLocationsFilteredPaginated(LocationFilters filters) {
        var filtered = locationRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToLocationReadOnlyDTO));
    }

    private Specification<Location> getSpecsFromFilters(LocationFilters filters) {
        return Specification
                .where(LocationSpecification.locationNameLike(filters.getName()))
                .and(LocationSpecification.locationIsActive(filters.getIsActive()));
    }


}
