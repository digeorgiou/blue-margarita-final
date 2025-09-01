package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.LocationSpecification;
import gr.aueb.cf.bluemargarita.dto.location.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
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

@SuppressWarnings("unused")
@Service
public class LocationService implements ILocationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(LocationService.class);
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final SaleProductRepository saleProductRepository;
    private final Mapper mapper;

    @Autowired
    public LocationService(LocationRepository locationRepository, UserRepository userRepository,
                           SaleRepository saleRepository, ProductRepository productRepository, SaleProductRepository saleProductRepository, Mapper mapper) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.saleProductRepository = saleProductRepository;
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

        if (!existingLocation.getName().equals(dto.name())){
            validateUniqueName(dto.name());
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

        Integer totalSales = saleRepository.countByLocationId(id);

        if (totalSales > 0) {
            // Soft Delete if location is used in any sales
            location.setIsActive(false);
            location.setDeletedAt(LocalDateTime.now());
            locationRepository.save(location);

            LOGGER.info("Location {} soft deleted. Used in {} sales",
                    location.getName(), totalSales);
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

        Location location = getLocationEntityById(id);

        return mapper.mapToLocationReadOnlyDTO(location);
    }

    // =============================================================================
    // VIEW LOCATIONS PAGE
    // =============================================================================

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
    public LocationDetailedViewDTO getLocationDetailedById(Long locationId) throws EntityNotFoundException {

        Location location = getLocationEntityById(locationId);

        LocationAnalyticsDTO analytics = getLocationAnalytics(locationId);

        List<ProductStatsSummaryDTO> topProducts = getTopProductsInLocation(locationId);

        return mapper.mapToLocationDetailedDTO(location, analytics, topProducts);

    }

    // =============================================================================
    // RECORD SALE PAGE
    // =============================================================================

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
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
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
            throw new EntityAlreadyExistsException("Location", "Υπάρχει ήδη τοποθεσία με όνομα " + name);
        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Analytics Calculations
    // =============================================================================

    private LocationAnalyticsDTO getLocationAnalytics(Long locationId) {
        // All-time metrics
        Integer totalSalesCount = saleRepository.countByLocationId(locationId);
        if (totalSalesCount == 0) {
            return createEmptyLocationAnalytics();
        }

        BigDecimal totalRevenue = saleRepository.sumRevenueByLocationId(locationId);
        BigDecimal averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalSalesCount), 2, RoundingMode.HALF_UP);
        LocalDate lastSaleDate = saleRepository.findLastSaleDateByLocationId(locationId);

        // Recent performance
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = saleRepository.countByLocationIdAndDateRange(locationId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = saleRepository.sumRevenueByLocationIdAndDateRange(locationId, thirtyDaysAgo, today);

        // Yearly performance
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

        List<Long> productIds = saleProductRepository.findDistinctProductIdsByLocationId(locationId);

        if(productIds.isEmpty()) {
            return Collections.emptyList();
        }

        return productIds.stream()
                .limit(10)
                .map(productId -> getProductSalesStatsForLocation(productId,locationId))
                .flatMap(Optional::stream)
                .sorted((p1,p2)-> p2.totalRevenue().compareTo(p1.totalRevenue()))
                .collect(Collectors.toList());
    }

    private Optional<ProductStatsSummaryDTO> getProductSalesStatsForLocation(Long productId, Long locationId) {

        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);
        BigDecimal totalSold = saleProductRepository.sumQuantityByProductIdAndLocationId(productId, locationId);
        if(totalSold == null || totalSold.compareTo(BigDecimal.ZERO) == 0){
            return Optional.empty();
        }

        BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductIdAndLocationId(productId, locationId);
        LocalDate lastSaleDate = saleProductRepository.findLastSaleDateByProductIdAndLocationId(productId, locationId);

        return Optional.of(new ProductStatsSummaryDTO(productId, productName, productCode, totalSold, totalRevenue, lastSaleDate));


    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<Location> getSpecsFromFilters(LocationFilters filters) {
        return Specification
                .where(LocationSpecification.locationNameLike(filters.getName()))
                .and(LocationSpecification.locationIsActive(filters.getIsActive()));
    }
}