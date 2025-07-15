package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.LocationSpecification;
import gr.aueb.cf.bluemargarita.dto.location.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.LocationRepository;
import gr.aueb.cf.bluemargarita.repository.SaleRepository;
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
    public LocationService(LocationRepository locationRepository, UserRepository userRepository, SaleRepository saleRepository, Mapper mapper) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.saleRepository = saleRepository;
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

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

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
    public LocationDetailedDTO getLocationDetailedById(Long id) throws EntityNotFoundException {

        LOGGER.debug("Retrieving optimized simple analytics for location id: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id=" + id + " was not found"));

        // ✅ OPTIMIZED: Use repository methods instead of loading all sales

        // Basic metrics using single queries
        Integer totalSalesCount = saleRepository.countByLocationId(id);

        if (totalSalesCount == 0) {
            // No sales - return empty metrics
            return new LocationDetailedDTO(
                    location.getId(),
                    location.getName(),
                    location.getCreatedAt(),
                    location.getUpdatedAt(),
                    location.getCreatedBy().getUsername(),
                    location.getLastUpdatedBy().getUsername(),
                    location.getIsActive(),
                    location.getDeletedAt(),
                    0,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    null,
                    null,
                    0,
                    BigDecimal.ZERO,
                    0,
                    BigDecimal.ZERO
            );
        }

        // Get aggregated data in single queries (no loading all sales into memory)
        BigDecimal totalRevenue = saleRepository.sumRevenueByLocationId(id);
        LocalDate firstSaleDate = saleRepository.findFirstSaleDateByLocationId(id);
        LocalDate lastSaleDate = saleRepository.findLastSaleDateByLocationId(id);

        BigDecimal averageOrderValue = totalRevenue != null && totalSalesCount > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(totalSalesCount), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        // Recent performance (last 30 days) using date-filtered query
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        Integer recentSalesCount = saleRepository.countByLocationIdAndDateRange(id, thirtyDaysAgo, LocalDate.now());
        BigDecimal recentRevenue = saleRepository.sumRevenueByLocationIdAndDateRange(id, thirtyDaysAgo, LocalDate.now());

        // Yearly performance (current year) using date-filtered query
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate yearEnd = LocalDate.now();
        Integer yearlySalesCount = saleRepository.countByLocationIdAndDateRange(id, yearStart, yearEnd);
        BigDecimal yearlySalesRevenue = saleRepository.sumRevenueByLocationIdAndDateRange(id, yearStart, yearEnd);

        LOGGER.debug("Optimized simple analytics completed for location '{}': totalSales={}, totalRevenue={}, yearlySales={}",
                location.getName(), totalSalesCount, totalRevenue, yearlySalesCount);

        return new LocationDetailedDTO(
                location.getId(),
                location.getName(),
                location.getCreatedAt(),
                location.getUpdatedAt(),
                location.getCreatedBy().getUsername(),
                location.getLastUpdatedBy().getUsername(),
                location.getIsActive(),
                location.getDeletedAt(),
                totalSalesCount,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                averageOrderValue,
                firstSaleDate,
                lastSaleDate,
                recentSalesCount,
                recentRevenue != null ? recentRevenue : BigDecimal.ZERO,
                yearlySalesCount,
                yearlySalesRevenue != null ? yearlySalesRevenue : BigDecimal.ZERO
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private Specification<Location> getSpecsFromFilters(LocationFilters filters) {
        return Specification
                .where(LocationSpecification.locationNameLike(filters.getName()))
                .and(LocationSpecification.locationIsActive(filters.getIsActive()));
    }
}