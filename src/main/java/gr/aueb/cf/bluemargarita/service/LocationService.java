package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.LocationSpecification;
import gr.aueb.cf.bluemargarita.dto.category.CategoryAnalyticsDTO;
import gr.aueb.cf.bluemargarita.dto.location.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.LocationRepository;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.SaleRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocationService implements ILocationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LocationService.class);
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final Mapper mapper;

    @Autowired
    public LocationService(LocationRepository locationRepository, UserRepository userRepository,
                           SaleRepository saleRepository, Mapper mapper) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.saleRepository = saleRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LocationReadOnlyDTO createLocation(LocationInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        validateUniqueName(dto.name());

        Location location = mapper.mapLocationInsertToModel(dto);

        User creator = getUserEntityById(dto.creatorUserId());

        location.setCreatedBy(creator);
        location.setLastUpdatedBy(creator);

        Location insertedLocation = locationRepository.save(location);

        LOGGER.info("Location created with id: {}", insertedLocation.getId());

        return mapper.mapToLocationReadOnlyDTO(insertedLocation);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LocationReadOnlyDTO updateLocation(LocationUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Location existingLocation = getLocationEntityById(dto.locationId());

        if (!existingLocation.getName().equals(dto.name()) && locationRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Location", "Location with" +
                    " description " + dto.name() + " already exists");
        }

        User updater = getUserEntityById(dto.updaterUserId());

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

        Location location = getLocationEntityById(id);

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

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public LocationReadOnlyDTO getLocationById(Long id) throws EntityNotFoundException {

        Location location = getLocationEntityById(id);

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
    public boolean nameExists(String name) {

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

    @Override
    @Transactional(readOnly = true)
    public List<LocationForDropdownDTO> getActiveLocationsForDropdown() {
        return locationRepository.findByIsActiveTrue()
                .stream()
                .map(location -> new LocationForDropdownDTO(location.getId(), location.getName()))
                .sorted((l1, l2) -> l1.name().compareToIgnoreCase(l2.name()))
                .collect(Collectors.toList());


    }

    // =============================================================================
    // ANALYTICS AND DETAILED VIEWS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public LocationDetailedViewDTO getLocationDetailedById(Long locationId) throws EntityNotFoundException {

        Location location = getLocationEntityById(locationId);

        LocationAnalyticsDTO analytics = getLocationAnalytics(locationId);

        List<ProductStatsSummaryDTO> topProducts = getTopProductsInLocation(locationId);

        return mapper.mapToLocationDetailedDTO(location, analytics, topProducts);

    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private Location getLocationEntityById(Long locationId) throws EntityNotFoundException{
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id=" + locationId + " was not found"));
    }

    private User getUserEntityById(Long userId) throws EntityNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + userId + " was not found"));
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if (locationRepository.existsByName(name)) {
            throw new EntityAlreadyExistsException("Location", "Location with" +
                    " name " + name + " already exists");
        }
    }

    private LocationAnalyticsDTO getLocationAnalytics(Long locationId) {
        // All-time metrics (like your customer metrics)
        Integer totalSalesCount = saleRepository.countByLocationId(locationId);
        if (totalSalesCount == 0) {
            return createEmptyLocationAnalytics();
        }

        BigDecimal totalRevenue = saleRepository.sumRevenueByLocationId(locationId);
        BigDecimal averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalSalesCount), 2, RoundingMode.HALF_UP);
        LocalDate lastSaleDate = saleRepository.findLastSaleDateByLocationId(locationId);

        // Recent performance (exact same pattern as customer)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = saleRepository.countByLocationIdAndDateRange(locationId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = saleRepository.sumRevenueByLocationIdAndDateRange(locationId, thirtyDaysAgo, today);

        // Yearly performance (exact same pattern as customer)
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Integer yearlySalesCount = saleRepository.countByLocationIdAndDateRange(locationId, yearStart, today);
        BigDecimal yearlySalesRevenue = saleRepository.sumRevenueByLocationIdAndDateRange(locationId, yearStart, today);

        return new LocationAnalyticsDTO(
                totalRevenue,
                totalSalesCount,
                averageOrderValue,
                lastSaleDate,
                recentSalesCount,
                recentRevenue,
                yearlySalesCount,
                yearlySalesRevenue
        );
    }

    private LocationAnalyticsDTO createEmptyLocationAnalytics() {
        return new LocationAnalyticsDTO(
                BigDecimal.ZERO,    // totalRevenue
                0,                  // totalSalesCount
                BigDecimal.ZERO,    // averageOrderValue
                null,               // lastSaleDate
                0,                  // recentSalesCount
                BigDecimal.ZERO,    // recentRevenue
                0,                  // yearlySalesCount
                BigDecimal.ZERO     // yearlySalesRevenue
        );
    }

    List<ProductStatsSummaryDTO> getTopProductsInLocation(Long locationId){
        return Collections.emptyList();
    }


    private Specification<Location> getSpecsFromFilters(LocationFilters filters) {
        return Specification
                .where(LocationSpecification.locationNameLike(filters.getName()))
                .and(LocationSpecification.locationIsActive(filters.getIsActive()));
    }
}