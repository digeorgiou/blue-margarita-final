package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.MaterialSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;
import gr.aueb.cf.bluemargarita.dto.material.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Material;
import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.model.User;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class MaterialService implements IMaterialService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MaterialService.class);
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMaterialRepository productMaterialRepository;
    private final SaleProductRepository saleProductRepository;
    private final CategoryRepository categoryRepository;
    private final PurchaseMaterialRepository purchaseMaterialRepository;
    private final Mapper mapper;

    @Autowired
    public MaterialService(MaterialRepository materialRepository, UserRepository userRepository,
                           ProductRepository productRepository, ProductMaterialRepository productMaterialRepository,
                           SaleProductRepository saleProductRepository, CategoryRepository categoryRepository,
                           PurchaseMaterialRepository purchaseMaterialRepository, Mapper mapper) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productMaterialRepository = productMaterialRepository;
        this.saleProductRepository = saleProductRepository;
        this.categoryRepository = categoryRepository;
        this.purchaseMaterialRepository = purchaseMaterialRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialReadOnlyDTO createMaterial(MaterialInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        validateUniqueName(dto.name());

        Material material = mapper.mapMaterialInsertToModel(dto);

        User creator = getUserEntityById(dto.creatorUserId());

        material.setCreatedBy(creator);
        material.setLastUpdatedBy(creator);

        Material insertedMaterial = materialRepository.save(material);

        LOGGER.info("Material created with id: {}", insertedMaterial.getId());

        return mapper.mapToMaterialReadOnlyDTO(insertedMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialReadOnlyDTO updateMaterial(MaterialUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Material existingMaterial = getMaterialEntityById(dto.materialId());

        if (!existingMaterial.getName().equals(dto.name())){
            validateUniqueName(dto.name());
        }

        User updater = getUserEntityById(dto.updaterUserId());

        Material updatedMaterial = mapper.mapMaterialUpdateToModel(dto, existingMaterial);
        updatedMaterial.setLastUpdatedBy(updater);

        Material savedMaterial = materialRepository.save(updatedMaterial);

        LOGGER.info("Material {} updated by user {}", savedMaterial.getName(), updater.getUsername());

        return mapper.mapToMaterialReadOnlyDTO(savedMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) throws EntityNotFoundException {

        Material material = getMaterialEntityById(id);

        Integer totalProducts = productMaterialRepository.countByMaterialId(id);
        Integer totalPurchases = materialRepository.countPurchasesContainingMaterial(id);

        if (totalProducts > 0 || totalPurchases > 0) {
            // Soft Delete if material is used in any purchases or products
            material.setIsActive(false);
            material.setDeletedAt(LocalDateTime.now());
            materialRepository.save(material);

            LOGGER.info("Material {} soft deleted. Used in {} purchases and {} products",
                    material.getName(),
                    totalPurchases,
                    totalProducts);
        } else {
            // Hard delete if material not used anywhere
            materialRepository.delete(material);
            LOGGER.info("Material {} hard deleted (not used in any purchases or products)", material.getName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialReadOnlyDTO getMaterialById(Long id) throws EntityNotFoundException {

        Material material = getMaterialEntityById(id);

        return mapper.mapToMaterialReadOnlyDTO(material);
    }

    // =============================================================================
    // MATERIALS MANAGEMENT PAGE
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<MaterialReadOnlyDTO> getMaterialsFilteredPaginated(MaterialFilters filters) {
        var filtered = materialRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToMaterialReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialDetailedViewDTO getMaterialDetailedById(Long materialId) throws EntityNotFoundException {

        Material material = getMaterialEntityById(materialId);

        MaterialAnalyticsDTO analytics = getMaterialAnalytics(materialId);
        List<CategoryUsageDTO> categoryDistribution = getCategoryDistribution(materialId);
        List<ProductUsageDTO> topProductsUsage = getTopProductsUsingMaterial(materialId);

        return mapper.mapToMaterialDetailedViewDTO(material, analytics, topProductsUsage, categoryDistribution);
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductUsageDTO> getAllProductsUsingMaterial(Long materialId, Pageable pageable)
            throws EntityNotFoundException {

        // Verify material exists
        getMaterialEntityById(materialId);

        // Apply default sorting if none specified
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "finalSellingPriceRetail")
            );
        }

        // Use specification to find products
        Specification<Product> spec = ProductSpecification.hasProductMaterial(materialId);
        Page<Product> products = productRepository.findAll(spec, pageable);

        // Map to DTOs
        Page<ProductUsageDTO> mappedProducts = products.map(product -> {
            try {
                return product.getAllProductMaterials()
                        .stream()
                        .filter(pm -> pm.getMaterial().getId().equals(materialId))
                        .findFirst()
                        .map(productMaterial -> {
                            BigDecimal quantity = productMaterial.getQuantity();
                            BigDecimal costImpact = quantity.multiply(productMaterial.getMaterial().getCurrentUnitCost());

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
            } catch (Exception e) {
                LOGGER.error("Error processing product {} for material {}: {}",
                        product.getId(), materialId, e.getMessage(), e);
                return null;
            }
        });

        return new Paginated<>(mappedProducts);
    }

    // =============================================================================
    // MATERIAL SEARCH FOR RECORD PURCHASE PAGE
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaterialSearchResultDTO> searchMaterialsForAutocomplete(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            return Collections.emptyList();
        }

        return materialRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(searchTerm.trim())
                .stream()
                .limit(10)
                .map(material -> new MaterialSearchResultDTO(
                        material.getId(),
                        material.getName(),
                        material.getUnitOfMeasure(),
                        material.getCurrentUnitCost() //  Shows as reference price

                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Helper method to create empty metrics DTO when no products use the material
     */

    private MaterialAnalyticsDTO getMaterialAnalytics(Long materialId){

        Integer totalProductsUsing = productMaterialRepository.countByMaterialId(materialId);
        if (totalProductsUsing == 0) {
            return createEmptyMaterialAnalytics();
        }
        BigDecimal averageCostPerProduct = materialRepository.calculateAverageCostPerProductByMaterialId(materialId);
        Integer purchaseCount = purchaseMaterialRepository.countPurchasesByMaterialId(materialId);
        LocalDate lastPurchaseDate = purchaseMaterialRepository.findLastPurchaseDateByMaterialId(materialId);

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate today = LocalDate.now();

        BigDecimal recentPurchaseQuantity = purchaseMaterialRepository.sumQuantityByMaterialIdAndDateRange(materialId, thirtyDaysAgo, today);
        BigDecimal yearlyPurchaseQuantity = purchaseMaterialRepository.sumQuantityByMaterialIdAndDateRange(materialId, yearStart, today);
        BigDecimal thisYearAveragePurchasePrice = purchaseMaterialRepository.calculateAveragePriceByMaterialIdAndDateRange(materialId, yearStart, today);

        // Last year's average purchase price (if there are purchases)
        LocalDate lastYearStart = LocalDate.of(LocalDate.now().getYear() - 1, 1, 1);
        LocalDate lastYearEnd = LocalDate.of(LocalDate.now().getYear() - 1, 12, 31);
        BigDecimal lastYearAveragePurchasePrice = purchaseMaterialRepository.calculateAveragePriceByMaterialIdAndDateRange(materialId, lastYearStart, lastYearEnd);
        // Set to null if 0 (no purchases last year)
        if (lastYearAveragePurchasePrice.compareTo(BigDecimal.ZERO) == 0) {
            lastYearAveragePurchasePrice = null;
        }

        Integer totalSalesCount = saleProductRepository.countSalesByMaterialId(materialId);
        BigDecimal totalRevenue = BigDecimal.ZERO;
        LocalDate lastSaleDate = null;

        if(totalSalesCount > 0){
            totalRevenue = saleProductRepository.sumRevenueByMaterialId(materialId);
            lastSaleDate = saleProductRepository.findLastSaleDateByMaterialId(materialId);
        }

        // Recent sales  (last 30 days)
        Integer recentSalesCount = saleProductRepository.countSalesByMaterialIdAndDateRange(materialId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = saleProductRepository.sumRevenueByMaterialIdAndDateRange(materialId, thirtyDaysAgo, today);

        // Yearly performance
        Integer yearlySalesCount = saleProductRepository.countSalesByMaterialIdAndDateRange(materialId, yearStart, today);
        BigDecimal yearlySalesRevenue = saleProductRepository.sumRevenueByMaterialIdAndDateRange(materialId, yearStart, today);

        return new MaterialAnalyticsDTO(
                totalProductsUsing,
                averageCostPerProduct != null ? averageCostPerProduct : BigDecimal.ZERO,
                purchaseCount,
                lastPurchaseDate,
                recentPurchaseQuantity,
                yearlyPurchaseQuantity,
                thisYearAveragePurchasePrice,
                lastYearAveragePurchasePrice,
                totalRevenue,
                totalSalesCount,
                lastSaleDate,
                recentSalesCount,
                recentRevenue,
                yearlySalesCount,
                yearlySalesRevenue
        );

    }

    private MaterialAnalyticsDTO createEmptyMaterialAnalytics() {
        return new MaterialAnalyticsDTO(
                0,
                BigDecimal.ZERO,
                0,
                null,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                0,
                null,
                0,
                BigDecimal.ZERO,
                0,
                BigDecimal.ZERO
        );
    }

    private Material getMaterialEntityById(Long materialId) throws EntityNotFoundException{
        return materialRepository.findById(materialId).orElseThrow(() ->
                new EntityNotFoundException("Material", "Material with id=" + materialId +
                        " was not found"));
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if (materialRepository.existsByName(name)) {
            throw new EntityAlreadyExistsException("Material", "Material with description "
                    + name + " already exists");
        }
    }

    private User getUserEntityById(Long userId) throws EntityNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + userId + " was not found"));
    }

    private List<ProductUsageDTO> getTopProductsUsingMaterial(Long materialId) {
        // Get products that use this material
        List<Long> productIds = productRepository.findProductIdsByMaterialId(materialId);

        if (productIds.isEmpty()) {
            return Collections.emptyList();
        }

        BigDecimal materialCost = materialRepository.findCostPerUnitById(materialId);

        return productIds.stream()
                .limit(10)
                .map(productId -> getProductMaterialUsage(productId, materialId, materialCost))
                .flatMap(Optional::stream)
                .sorted((p1, p2) -> p2.costImpact().compareTo(p1.costImpact()))
                .collect(Collectors.toList());
    }

    private Optional<ProductUsageDTO> getProductMaterialUsage(Long productId, Long materialId, BigDecimal materialCost) {
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);
        String categoryName = productRepository.findCategoryNameByProductId(productId);
        BigDecimal usageQuantity = productMaterialRepository.findQuantityByProductIdAndMaterialId(productId, materialId);

        if (usageQuantity == null || usageQuantity.compareTo(BigDecimal.ZERO) == 0) {
            return Optional.empty();
        }

        BigDecimal costImpact = usageQuantity.multiply(materialCost);

        return Optional.of(new ProductUsageDTO(productId, productName, productCode, usageQuantity, costImpact, categoryName));
    }

    private List<CategoryUsageDTO> getCategoryDistribution(Long materialId){
        List<Long> categoryIds = productRepository.findCategoryIdsByMaterialId(materialId);

        if (categoryIds.isEmpty()) {
            return Collections.emptyList();
        }

        Integer totalProducts = productMaterialRepository.countByMaterialId(materialId);

        return categoryIds.stream()
                .map(categoryId -> getCategoryUsageForMaterial(categoryId, materialId, totalProducts))
                .flatMap(Optional::stream)
                .sorted((c1, c2) -> c2.productCount().compareTo(c1.productCount()))
                .collect(Collectors.toList());
    }

    private Optional<CategoryUsageDTO> getCategoryUsageForMaterial(Long categoryId, Long materialId, Integer totalProducts) {
        String categoryName = categoryRepository.findCategoryNameById(categoryId);
        Integer productCount = productRepository.countProductsByCategoryIdAndMaterialId(categoryId, materialId);

        if (productCount == 0) {
            return Optional.empty();
        }

        Double percentage = (productCount * 100.0) / totalProducts;

        return Optional.of(new CategoryUsageDTO(categoryId, categoryName, productCount, percentage));
    }

    /**
     * Creates JPA Specification from filter criteria
     * Combines name filtering and active status filtering using AND logic
     */

    private Specification<Material> getSpecsFromFilters(MaterialFilters filters) {
        return Specification
                .where(MaterialSpecification.materialNameLike(filters.getName()))
                .and(MaterialSpecification.materialIsActive(filters.getIsActive()));
    }

}

