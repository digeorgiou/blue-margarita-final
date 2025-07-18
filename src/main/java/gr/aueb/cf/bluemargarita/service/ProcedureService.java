package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProcedureSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.ProcedureRepository;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProcedureService implements IProcedureService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProcedureService.class);
    private final ProcedureRepository procedureRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final Mapper mapper;

    @Autowired
    public ProcedureService(ProcedureRepository procedureRepository, UserRepository userRepository, ProductRepository productRepository, Mapper mapper) {
        this.procedureRepository = procedureRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProcedureReadOnlyDTO createProcedure(ProcedureInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (procedureRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Procedure", "Procedure with name " + dto.name() + " already exists");
        }

        Procedure procedure = mapper.mapProcedureInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        procedure.setCreatedBy(creator);
        procedure.setLastUpdatedBy(creator);

        Procedure insertedProcedure = procedureRepository.save(procedure);

        LOGGER.info("Procedure created with id: {}", insertedProcedure.getId());

        return mapper.mapToProcedureReadOnlyDTO(insertedProcedure);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProcedureReadOnlyDTO updateProcedure(ProcedureUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Procedure existingProcedure = procedureRepository.findById(dto.procedureId())
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + dto.procedureId() + " was not found"));

        if (!existingProcedure.getName().equals(dto.name()) && procedureRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Procedure", "Procedure with name " + dto.name() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Procedure updatedProcedure = mapper.mapProcedureUpdateToModel(dto, existingProcedure);
        updatedProcedure.setLastUpdatedBy(updater);

        Procedure savedProcedure = procedureRepository.save(updatedProcedure);

        LOGGER.info("Procedure {} updated by user {}", savedProcedure.getName(), updater.getUsername());

        return mapper.mapToProcedureReadOnlyDTO(savedProcedure);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProcedure(Long id) throws EntityNotFoundException {

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + id + " was not found"));

        Integer productCount = procedureRepository.countProductsByProcedureId(id);

        if (productCount > 0) {
            // Soft Delete if procedure is used in any products
            procedure.setIsActive(false);
            procedure.setDeletedAt(LocalDateTime.now());
            procedureRepository.save(procedure);

            LOGGER.info("Procedure {} soft deleted. Used in {} products",
                    procedure.getName(), productCount);
        } else {
            // Hard delete if procedure not used anywhere
            procedureRepository.delete(procedure);
            LOGGER.info("Procedure {} hard deleted (not used in any products)", procedure.getName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProcedureReadOnlyDTO getProcedureById(Long id) throws EntityNotFoundException {

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + id + " was not found"));

        return mapper.mapToProcedureReadOnlyDTO(procedure);
    }

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProcedureReadOnlyDTO> getAllActiveProcedures() {
        List<Procedure> procedures = procedureRepository.findByIsActiveTrue();

        return procedures.stream().map(mapper::mapToProcedureReadOnlyDTO)
                .collect(Collectors.toList());
    }

    public List<ProcedureForDropdownDTO> getActiveProceduresForDropdown() {
        return procedureRepository.findByIsActiveTrue()
                .stream()
                .map(procedure -> new ProcedureForDropdownDTO(
                        procedure.getId(),
                        procedure.getName()
                ))
                .sorted((p1, p2) -> p1.name().compareToIgnoreCase(p2.name()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcedureReadOnlyDTO> getFilteredProcedures(ProcedureFilters filters) {
        return procedureRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToProcedureReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProcedureReadOnlyDTO> getProceduresFilteredPaginated(ProcedureFilters filters) {
        var filtered = procedureRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToProcedureReadOnlyDTO));
    }

    // =============================================================================
    // ANALYTICS AND DETAILED VIEWS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public ProcedureDetailedViewDTO getProcedureDetailedById(Long procedureId) throws EntityNotFoundException {

        Procedure procedure = getProcedureEntityById(procedureId);

        ProcedureAnalyticsDTO analytics = getProcedureAnalytics(procedureId);
        List<CategoryUsageDTO> categoryDistribution = getCategoryDistributionForProcedure(procedureId);
        List<ProductUsageDTO> topProductsUsage = getTopProductsUsingProcedure(procedureId);

        return mapper.mapToProcedureDetailedDTO(procedure, analytics, categoryDistribution, topProductsUsage);

//        Integer totalProductsUsing = procedureRepository.countProductsByProcedureId(id);
//
//        if (totalProductsUsing == 0) {
//            // No products using this procedure - return empty metrics
//            return createEmptyMetricsDTO(procedure);
//        }
//
//        // Get cost statistics using repository aggregation
//        Object[] costStats = procedureRepository.calculateCostStatsByProcedureId(id);
//        BigDecimal averageProcedureCost = costStats != null && costStats[0] != null ?
//                (BigDecimal) costStats[0] : BigDecimal.ZERO;
//        BigDecimal minProcedureCost = costStats != null && costStats[1] != null ?
//                (BigDecimal) costStats[1] : BigDecimal.ZERO;
//        BigDecimal maxProcedureCost = costStats != null && costStats[2] != null ?
//                (BigDecimal) costStats[2] : BigDecimal.ZERO;
//
//        // Get average product selling price using repository aggregation
//        BigDecimal averageProductSellingPrice = procedureRepository.calculateAverageProductPriceByProcedureId(id);
//        if (averageProductSellingPrice == null) {
//            averageProductSellingPrice = BigDecimal.ZERO;
//        }
//
//        // Get category distribution using repository aggregation
//        List<Object[]> categoryData = procedureRepository.calculateCategoryDistributionByProcedureId(id, totalProductsUsing);
//        List<CategoryUsageDTO> categoryDistribution = categoryData.stream()
//                .map(data -> new CategoryUsageDTO(
//                        (Long) data[0],           // categoryId
//                        (String) data[1],         // categoryName
//                        ((Number) data[2]).intValue(), // productCount
//                        ((Number) data[3]).doubleValue() // percentage
//                ))
//                .collect(Collectors.toList());
//
//        // Get top products using this procedure (limit to 10 for performance)
//        PageRequest topProductsPageable = PageRequest.of(0, 10);
//        List<Object[]> topProductsData = procedureRepository.findTopProductsByProcedureUsage(id, topProductsPageable);
//
//        List<ProductUsageDTO> topProductsUsage = topProductsData.stream()
//                .map(data -> new ProductUsageDTO(
//                        (Long) data[0],           // productId
//                        (String) data[1],         // productName
//                        (String) data[2],         // productCode
//                        BigDecimal.ONE,           // usageQuantity (always 1 for procedures)
//                        (BigDecimal) data[3],     // costImpact (procedure cost for this product)
//                        (String) data[4]          // categoryName
//                ))
//                .collect(Collectors.toList());
//
//        LOGGER.debug("Optimized analytics completed for procedure '{}': totalProducts={}, avgCost={}, categories={}, topProducts={}",
//                procedure.getName(), totalProductsUsing, averageProcedureCost, categoryDistribution.size(), topProductsUsage.size());
//
//        return new ProcedureDetailedViewDTO(
//                procedure.getId(),
//                procedure.getName(),
//                procedure.getCreatedAt(),
//                procedure.getUpdatedAt(),
//                procedure.getCreatedBy().getUsername(),
//                procedure.getLastUpdatedBy().getUsername(),
//                procedure.getIsActive(),
//                procedure.getDeletedAt(),
//                totalProductsUsing,
//                averageProcedureCost,
//                minProcedureCost,
//                maxProcedureCost,
//                averageProductSellingPrice,
//                categoryDistribution,
//                topProductsUsage
//        );
    }

    // =============================================================================
    // PRODUCT RELATIONSHIP OPERATIONS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductUsageDTO> getAllProductsUsingProcedure(Long procedureId, Pageable pageable)
            throws EntityNotFoundException {

        // Verify procedure exists
        procedureRepository.findById(procedureId)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + procedureId + " was not found"));

        // Apply default sorting if none specified
        if (pageable.getSort().isUnsorted()) {
            // Default: Sort by procedure cost descending
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "finalSellingPriceRetail")
            );
        }

        Specification<Product> spec = ProductSpecification.hasProcedureProduct(procedureId);
        Page<Product> products = productRepository.findAll(spec, pageable);

        Page<ProductUsageDTO> mappedProducts = products.map(product -> {
            return  product.getAllProcedureProducts()
                    .stream()
                    .filter(pm -> pm.getProcedure().getId().equals(procedureId))
                    .findFirst()
                    .map(procedureProduct -> {
                        BigDecimal quantity = BigDecimal.ONE;
                        BigDecimal costImpact = procedureProduct.getCost();

                        return new ProductUsageDTO(
                                product.getId(),
                                product.getName(),
                                product.getCode(),
                                quantity,
                                costImpact,
                                product.getCategory() != null ? product.getCategory().getName() : "No Category"
                        );

                    })
                    .orElse(null);

        });

        return new Paginated<>(mappedProducts);

    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private Procedure getProcedureEntityById(Long procedureId) throws EntityNotFoundException{
        return procedureRepository.findById(procedureId)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + procedureId + " was not found"));
    }

    private User getUserEntityById(Long userId) throws EntityNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + userId + " was not found"));
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if (procedureRepository.existsByName(name)) {
            throw new EntityAlreadyExistsException("Procedure", "Procedure with" +
                    " name " + name + " already exists");
        }
    }

    private ProcedureAnalyticsDTO getProcedureAnalytics(Long procedureId) {

        Integer totalProductsUsing = procedureRepository.countProductsByProcedureId(procedureId);
        // Check if procedure has usage first
        if (totalProductsUsing == 0) {
            return createEmptyProcedureAnalytics();
        }

        // Usage metrics (like your customer basic metrics)
        Object[] costStats = procedureRepository.calculateCostStatsByProcedureId(procedureId);
        BigDecimal averageProcedureCost = costStats[0] != null ? (BigDecimal) costStats[0] : BigDecimal.ZERO;
        BigDecimal minProcedureCost = costStats[1] != null ? (BigDecimal) costStats[1] : BigDecimal.ZERO;
        BigDecimal maxProcedureCost = costStats[2] != null ? (BigDecimal) costStats[2] : BigDecimal.ZERO;
        BigDecimal averageProductSellingPrice = procedureRepository.calculateAverageProductPriceByProcedureId(procedureId);

        // All-time sales metrics (like your customer all-time metrics)
        Integer totalSalesCount = procedureRepository.countSalesByProcedureId(procedureId);
        BigDecimal totalRevenue = BigDecimal.ZERO;
        LocalDate lastSaleDate = null;

        if (totalSalesCount > 0) {
            totalRevenue = procedureRepository.sumRevenueByProcedureId(procedureId);
            lastSaleDate = procedureRepository.findLastSaleDateByProcedureId(procedureId);
        }

        // Recent performance (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = procedureRepository.countSalesByProcedureIdAndDateRange(procedureId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = procedureRepository.sumRevenueByProcedureIdAndDateRange(procedureId, thirtyDaysAgo, today);

        // Yearly performance
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Integer yearlySalesCount = procedureRepository.countSalesByProcedureIdAndDateRange(procedureId, yearStart, today);
        BigDecimal yearlySalesRevenue = procedureRepository.sumRevenueByProcedureIdAndDateRange(procedureId, yearStart, today);

        return new ProcedureAnalyticsDTO(
                totalProductsUsing,
                averageProcedureCost,
                averageProductSellingPrice != null ? averageProductSellingPrice : BigDecimal.ZERO,
                totalRevenue,
                totalSalesCount,
                lastSaleDate,
                recentSalesCount,
                recentRevenue,
                yearlySalesCount,
                yearlySalesRevenue
        );
    }

    private ProcedureAnalyticsDTO createEmptyProcedureAnalytics() {
        return new ProcedureAnalyticsDTO(
                0,                  // totalProductsUsing
                BigDecimal.ZERO,    // averageProcedureCost
                BigDecimal.ZERO,    // averageProductSellingPrice
                BigDecimal.ZERO,    // totalRevenue
                0,                  // totalSalesCount
                null,               // lastSaleDate
                0,                  // recentSalesCount
                BigDecimal.ZERO,    // recentRevenue
                0,                  // yearlySalesCount
                BigDecimal.ZERO     // yearlySalesRevenue
        );
    }

    private List<CategoryUsageDTO> getCategoryDistributionForProcedure(Long procedureId) {
        // Your existing implementation
        return Collections.emptyList(); // placeholder
    }

    private List<ProductUsageDTO> getTopProductsUsingProcedure(Long procedureId) {
        // Your existing implementation
        return Collections.emptyList(); // placeholder
    }


    /**
     * Creates JPA Specification from filter criteria
     * Combines name filtering and active status filtering using AND logic
     */

    private Specification<Procedure> getSpecsFromFilters(ProcedureFilters filters) {
        return Specification
                .where(ProcedureSpecification.procedureNameLike(filters.getName()))
                .and(ProcedureSpecification.procedureIsActive(filters.getIsActive()));
    }
}