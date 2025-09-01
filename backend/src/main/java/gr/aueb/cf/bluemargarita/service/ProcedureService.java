package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.PricingIssueType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProcedureSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.*;
import gr.aueb.cf.bluemargarita.dto.product.MispricedProductAlertDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class ProcedureService implements IProcedureService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProcedureService.class);
    private final ProcedureRepository procedureRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductProcedureRepository productProcedureRepository;
    private final SaleProductRepository saleProductRepository;
    private final Mapper mapper;

    @Autowired
    public ProcedureService(ProcedureRepository procedureRepository, UserRepository userRepository, ProductRepository productRepository,
                            CategoryRepository categoryRepository, ProductProcedureRepository productProcedureRepository,
                            SaleProductRepository saleProductRepository, Mapper mapper) {
        this.procedureRepository = procedureRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productProcedureRepository = productProcedureRepository;
        this.saleProductRepository = saleProductRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProcedureReadOnlyDTO createProcedure(ProcedureInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        validateUniqueName(dto.name());

        Procedure procedure = mapper.mapProcedureInsertToModel(dto);

        User creator = getUserEntityById(dto.creatorUserId());

        procedure.setCreatedBy(creator);
        procedure.setLastUpdatedBy(creator);

        Procedure insertedProcedure = procedureRepository.save(procedure);

        LOGGER.info("Procedure created with id: {}", insertedProcedure.getId());

        return mapper.mapToProcedureReadOnlyDTO(insertedProcedure);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProcedureReadOnlyDTO updateProcedure(ProcedureUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Procedure existingProcedure = getProcedureEntityById(dto.procedureId());

        if (!existingProcedure.getName().equals(dto.name())){
            validateUniqueName(dto.name());
        }

        User updater = getUserEntityById(dto.updaterUserId());

        Procedure updatedProcedure = mapper.mapProcedureUpdateToModel(dto, existingProcedure);
        updatedProcedure.setLastUpdatedBy(updater);

        Procedure savedProcedure = procedureRepository.save(updatedProcedure);

        LOGGER.info("Procedure {} updated by user {}", savedProcedure.getName(), updater.getUsername());

        return mapper.mapToProcedureReadOnlyDTO(savedProcedure);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProcedure(Long id) throws EntityNotFoundException {

        Procedure procedure = getProcedureEntityById(id);

        Integer productCount = productProcedureRepository.countByProductId(id);

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
    // PROCEDURE VIEW PAGE AND ANALYTICS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProcedureReadOnlyDTO> getProceduresFilteredPaginated(ProcedureFilters filters) {
        var filtered = procedureRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToProcedureReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public ProcedureDetailedViewDTO getProcedureDetailedById(Long procedureId) throws EntityNotFoundException {

        Procedure procedure = getProcedureEntityById(procedureId);

        ProcedureAnalyticsDTO analytics = getProcedureAnalytics(procedureId);
        List<CategoryUsageDTO> categoryDistribution = getCategoryDistributionForProcedure(procedureId);
        List<ProductUsageDTO> topProductsUsage = getTopProductsUsingProcedure(procedureId);

        return mapper.mapToProcedureDetailedDTO(procedure, analytics, categoryDistribution, topProductsUsage);

    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductUsageDTO> getAllProductsUsingProcedure(Long procedureId, ProductFilters filters)
            throws EntityNotFoundException {

        // Verify procedure exists
        getProcedureEntityById(procedureId);

        // Apply default sorting if none specified
        if (filters.getPageable().getSort().isUnsorted()) {
            filters.setSortBy("finalSellingPriceRetail");
            filters.setSortDirection(Sort.Direction.DESC);
        }

        Specification<Product> spec = Specification
                .where(ProductSpecification.productUsesProcedureById(procedureId))
                .and(getProductSpecsFromFilters(filters));

        Page<Product> products = productRepository.findAll(spec, filters.getPageable());

        // Map to DTOs with procedure usage information
        Page<ProductUsageDTO> mappedProducts = products.map(product -> {
            try {
                return product.getAllProcedureProducts()
                        .stream()
                        .filter(pp -> pp.getProcedure().getId().equals(procedureId))
                        .findFirst()
                        .map(productProcedure -> {
                            BigDecimal costImpact = productProcedure.getCost();

                            return new ProductUsageDTO(
                                    product.getId(),
                                    product.getName(),
                                    product.getCode(),
                                    BigDecimal.ONE, // Procedures typically have quantity of 1
                                    costImpact,
                                    product.getCategory() != null ?
                                            product.getCategory().getName() : "No Category"
                            );
                        })
                        .orElse(null);
            } catch (Exception e) {
                LOGGER.error("Error processing product {} for procedure {}: {}",
                        product.getId(), procedureId, e.getMessage(), e);
                return null;
            }
        });

        return new Paginated<>(mappedProducts);

    }

    // =============================================================================
    // FOR DROPDOWN IN ADD-PRODUCT
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
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
    public List<ProcedureForDropdownDTO> searchProcedureForAutocomplete(String searchTerm){
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            return Collections.emptyList();
        }
        return procedureRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(searchTerm.trim())
                .stream()
                .limit(10)
                .map(procedure -> new ProcedureForDropdownDTO(
                        procedure.getId(),
                        procedure.getName()
                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
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
            throw new EntityAlreadyExistsException("Procedure", "Υπάρχει ήδη διαδικασία με όνομα " + name);
        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Analytics Calculations
    // =============================================================================

    private ProcedureAnalyticsDTO getProcedureAnalytics(Long procedureId) {

        Integer totalProductsUsing = productProcedureRepository.countByProcedureId(procedureId);
        // Check if procedure has usage first
        if (totalProductsUsing == 0) {
            return createEmptyProcedureAnalytics();
        }

        // Usage metrics
        BigDecimal averageProcedureCost = productProcedureRepository.calculateAverageCostByProcedureId(procedureId);

        BigDecimal averageProductSellingPrice = productProcedureRepository.calculateAverageProductPriceByProcedureId(procedureId);

        // All-time sales metrics
        Integer totalSalesCount = saleProductRepository.countSalesByProcedureId(procedureId);
        BigDecimal totalRevenue = BigDecimal.ZERO;
        LocalDate lastSaleDate = null;

        if (totalSalesCount > 0) {
            totalRevenue = saleProductRepository.sumRevenueByProcedureId(procedureId);
            lastSaleDate = saleProductRepository.findLastSaleDateByProcedureId(procedureId);
        }

        // Recent performance (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = saleProductRepository.countSalesByProcedureIdAndDateRange(procedureId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = saleProductRepository.sumRevenueByProcedureIdAndDateRange(procedureId, thirtyDaysAgo, today);

        // Yearly performance
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Integer yearlySalesCount = saleProductRepository.countSalesByProcedureIdAndDateRange(procedureId, yearStart, today);
        BigDecimal yearlySalesRevenue = saleProductRepository.sumRevenueByProcedureIdAndDateRange(procedureId, yearStart, today);

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

    private List<ProductUsageDTO> getTopProductsUsingProcedure(Long procedureId) {
        // Get products that use this procedure
        List<Long> productIds = productProcedureRepository.findProductIdsByProcedureId(procedureId);

        if (productIds.isEmpty()) {
            return Collections.emptyList();
        }

        return productIds.stream()
                .limit(10)
                .map(productId -> getProductProcedureUsage(productId, procedureId))
                .flatMap(Optional::stream)
                .sorted((p1, p2) -> p2.costImpact().compareTo(p1.costImpact()))
                .collect(Collectors.toList());
    }

    private Optional<ProductUsageDTO> getProductProcedureUsage(Long productId, Long procedureId) {
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);
        String categoryName = productRepository.findCategoryNameByProductId(productId);
        BigDecimal procedureCost = productProcedureRepository.findCostByProductIdAndProcedureId(productId, procedureId);

        if (procedureCost == null) {
            return Optional.empty();
        }

        return Optional.of(new ProductUsageDTO(productId, productName, productCode, BigDecimal.ONE, procedureCost, categoryName));
    }

    private List<CategoryUsageDTO> getCategoryDistributionForProcedure(Long procedureId) {
        // Get all categories that have products using this procedure
        List<Long> categoryIds = productProcedureRepository.findCategoryIdsByProcedureId(procedureId);

        if (categoryIds.isEmpty()) {
            return Collections.emptyList();
        }

        Integer totalProducts = productProcedureRepository.countByProcedureId(procedureId);

        return categoryIds.stream()
                .map(categoryId -> getCategoryUsageForProcedure(categoryId, procedureId, totalProducts))
                .flatMap(Optional::stream)
                .sorted((c1, c2) -> c2.productCount().compareTo(c1.productCount()))
                .collect(Collectors.toList());
    }

    private Optional<CategoryUsageDTO> getCategoryUsageForProcedure(Long categoryId, Long procedureId, Integer totalProducts) {
        String categoryName = categoryRepository.findCategoryNameById(categoryId);
        Integer productCount = productProcedureRepository.countByCategoryIdAndProcedureId(categoryId,procedureId);

        if (productCount == 0) {
            return Optional.empty();
        }

        Double percentage = (productCount * 100.0) / totalProducts;

        return Optional.of(new CategoryUsageDTO(categoryId, categoryName, productCount, percentage));
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<Procedure> getSpecsFromFilters(ProcedureFilters filters) {
        return Specification
                .where(ProcedureSpecification.procedureNameLike(filters.getName()))
                .and(ProcedureSpecification.procedureIsActive(filters.getIsActive()));
    }

    private Specification<Product> getProductSpecsFromFilters(ProductFilters filters){
        Specification<Product> spec = Specification
                .where(ProductSpecification.productNameOrCodeLike(filters.getNameOrCode()))
                .and(ProductSpecification.productCategoryId(filters.getCategoryId()))
                .and(ProductSpecification.productRetailPriceBetween(filters.getMinPrice(), filters.getMaxPrice()))
                .and(ProductSpecification.productStockBetween(filters.getMinStock(), filters.getMaxStock()))
                .and(ProductSpecification.productIsActive(filters.getIsActive()))
                .and(ProductSpecification.productLowStock(filters.getLowStock()));

        if (filters.getMaterialId() != null) {
            spec = spec.and(ProductSpecification.productContainsMaterialById(filters.getMaterialId()));
        } else if (filters.getMaterialName() != null && !filters.getMaterialName().trim().isEmpty()) {
            spec = spec.and(ProductSpecification.productContainsMaterialByName(filters.getMaterialName()));
        }

        return spec;
    }
}