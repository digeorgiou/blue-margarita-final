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
import gr.aueb.cf.bluemargarita.repository.CategoryRepository;
import gr.aueb.cf.bluemargarita.repository.MaterialRepository;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.parameters.P;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MaterialService implements IMaterialService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MaterialService.class);
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final Mapper mapper;

    @Autowired
    public MaterialService(MaterialRepository materialRepository, UserRepository userRepository, ProductRepository productRepository, CategoryRepository categoryRepository, Mapper mapper) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
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

        // Check both product usage AND purchase history
        boolean hasProductUsage = !material.getAllProductMaterials().isEmpty();
        boolean hasPurchaseHistory = !material.getAllPurchaseMaterials().isEmpty();

        if (hasProductUsage || hasPurchaseHistory) {
            // Soft Delete if material is used in any purchases or products
            material.setIsActive(false);
            material.setDeletedAt(LocalDateTime.now());
            materialRepository.save(material);

            LOGGER.info("Material {} soft deleted. Used in {} purchases and {} products",
                    material.getName(),
                    material.getAllPurchaseMaterials().size(),
                    material.getAllProductMaterials().size());
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
    // QUERY OPERATIONS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaterialReadOnlyDTO> getAllActiveMaterials() {

        List<Material> materials = materialRepository.findByIsActiveTrue();

        return materials.stream()
                .map(mapper::mapToMaterialReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialReadOnlyDTO> getFilteredMaterials(MaterialFilters filters) {
        return materialRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToMaterialReadOnlyDTO)
                .collect(Collectors.toList());
    }

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
    // ANALYTICS AND DETAILED VIEWS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public MaterialDetailedViewDTO getMaterialDetailedById(Long materialId) throws EntityNotFoundException {

        Material material = getMaterialEntityById(materialId);

        MaterialAnalyticsDTO analytics = getMaterialAnalytics(materialId);
        List<CategoryUsageDTO> categoryDistribution = getCategoryDistribution(materialId);
        List<ProductUsageDTO> topProductsUsage = getTopProductsUsingMaterial(materialId);

        return mapper.mapToMaterialDetailedViewDTO(material, analytics, topProductsUsage, categoryDistribution);
    }

//        // Basic metrics using single queries (following LocationService pattern)
//        Integer totalProductsUsing = materialRepository.countProductsUsingMaterial(id);
//
//        if (totalProductsUsing == 0) {
//            // No products using this material - return empty metrics
//            return createEmptyMaterialMetricsDTO(material);
//        }
//
//        // Get aggregated data in single queries (no loading all entities into memory)
//        Object[] usageStats = materialRepository.calculateUsageStatsByMaterialId(id);
//        BigDecimal avgCostPerProduct = materialRepository.calculateAverageCostPerProductByMaterialId(id);
//
//        // Purchase analytics using simple queries
//        Integer purchaseCount = materialRepository.countPurchasesContainingMaterial(id);
//        LocalDate lastPurchaseDate = materialRepository.findLastPurchaseDateByMaterialId(id);
//
//        // Calculate usage statistics from Object array
//        BigDecimal avgUsage = usageStats[0] != null ? (BigDecimal) usageStats[0] : BigDecimal.ZERO;
//        BigDecimal minUsage = usageStats[1] != null ? (BigDecimal) usageStats[1] : BigDecimal.ZERO;
//        BigDecimal maxUsage = usageStats[2] != null ? (BigDecimal) usageStats[2] : BigDecimal.ZERO;
//
//        // Get top products using this material (limited to 5, using aggregated query)
//        List<Object[]> topProductsData = materialRepository.findTopProductsByMaterialUsage(id, PageRequest.of(0, 5));
//        List<ProductUsageDTO> topProducts = mapToProductUsageDTOs(topProductsData);
//
//        LOGGER.debug("Optimized analytics completed for material '{}': productsUsing={}, purchaseCount={}",
//                material.getName(), totalProductsUsing, purchaseCount);
//
//        return new MaterialDetailedViewDTO(
//                material.getId(),
//                material.getName(),
//                material.getUnitOfMeasure(),
//                material.getCurrentUnitCost(),
//                material.getCreatedAt(),
//                material.getUpdatedAt(),
//                material.getCreatedBy() != null ? material.getCreatedBy().getUsername() : "system",
//                material.getLastUpdatedBy() != null ? material.getLastUpdatedBy().getUsername() : "system",
//                material.getIsActive(),
//                material.getDeletedAt(),
//                totalProductsUsing,
//                avgUsage,
//                minUsage,
//                maxUsage,
//                avgCostPerProduct != null ? avgCostPerProduct : BigDecimal.ZERO,
//                purchaseCount != null ? purchaseCount : 0,
//                lastPurchaseDate,
//                topProducts
//        );
//    }
//
//    // =============================================================================
    // PRODUCT RELATIONSHIP OPERATIONS
    // =============================================================================

//    @Override
//    @Transactional(readOnly = true)
//    public Paginated<ProductUsageDTO> getAllProductsUsingMaterial(Long materialId, Pageable pageable)
//            throws EntityNotFoundException {
//
//        // Verify material exists
//        materialRepository.findById(materialId)
//                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + materialId + " was not found"));
//
//        // Apply default sorting if none specified
//        if (pageable.getSort().isUnsorted()) {
//            pageable = PageRequest.of(
//                    pageable.getPageNumber(),
//                    pageable.getPageSize(),
//                    Sort.by(Sort.Direction.DESC, "finalSellingPriceRetail")
//            );
//        }
//
//        // Use specification to find products
//        Specification<Product> spec = ProductSpecification.hasProductMaterial(materialId);
//        Page<Product> products = productRepository.findAll(spec, pageable);
//
//        // Map to DTOs
//        Page<ProductUsageDTO> mappedProducts = products.map(product -> {
//            // Find the specific ProductMaterial for this material
//            return product.getAllProductMaterials()
//                    .stream()
//                    .filter(pm -> pm.getMaterial().getId().equals(materialId))
//                    .findFirst()
//                    .map(productMaterial -> {
//                        BigDecimal quantity = productMaterial.getQuantity();
//                        BigDecimal costImpact = quantity.multiply(productMaterial.getMaterial().getCurrentUnitCost());
//
//                        return new ProductUsageDTO(
//                                product.getId(),
//                                product.getName(),
//                                product.getCode(),
//                                quantity,
//                                costImpact,
//                                product.getCategory() != null ? product.getCategory().getName() : "No Category"
//                        );
//                    })
//                    .orElse(null);
//
//        });
//
//        return new Paginated<>(mappedProducts);
//    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductUsageDTO> getAllProductsUsingMaterial(Long materialId, Pageable pageable)
            throws EntityNotFoundException {

        LOGGER.debug("Starting getAllProductsUsingMaterial for materialId: {}", materialId);
        System.out.printf("Starting getAllProductsUsingMaterial for materialId: {}", materialId);
        System.out.println();

        // Verify material exists
        materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + materialId + " was not found"));

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

        LOGGER.debug("Found {} products using material {}", products.getNumberOfElements(), materialId);
        System.out.printf("Found {} products using material {}", products.getNumberOfElements(), materialId);
        System.out.println();
        // Map to DTOs
        Page<ProductUsageDTO> mappedProducts = products.map(product -> {
            try {
                LOGGER.debug("Processing product: {} (ID: {})", product.getName(), product.getId());
                System.out.printf("Processing product: {} (ID: {})", product.getName(), product.getId());
                System.out.println();

                return product.getAllProductMaterials()
                        .stream()
                        .filter(pm -> {
                            LOGGER.debug("Checking ProductMaterial with material ID: {}", pm.getMaterial().getId());
                            System.out.printf("Checking ProductMaterial with material ID: {}", pm.getMaterial().getId());
                            System.out.println();
                            return pm.getMaterial().getId().equals(materialId);
                        })
                        .findFirst()
                        .map(productMaterial -> {
                            LOGGER.debug("Found matching ProductMaterial, creating DTO");
                            System.out.printf("Found matching ProductMaterial, creating DTO");
                            System.out.println();
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
                System.out.printf("Error processing product {} for material {}: {}",
                        product.getId(), materialId, e.getMessage(), e);
                System.out.println();
                return null;
            }
        });

        return new Paginated<>(mappedProducts);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Helper method to create empty metrics DTO when no products use the material
     */

    private MaterialAnalyticsDTO getMaterialAnalytics(Long materialId){

        Integer totalProductsUsing = materialRepository.countProductsUsingMaterial(materialId);
        if (totalProductsUsing == 0) {
            return createEmptyMaterialAnalytics();
        }
        BigDecimal averageCostPerProduct = materialRepository.calculateAverageCostPerProductByMaterialId(materialId);
        Integer purchaseCount = materialRepository.countPurchasesContainingMaterial(materialId);
        LocalDate lastPurchaseDate = materialRepository.findLastPurchaseDateByMaterialId(materialId);

        Integer totalSalesCount = materialRepository.countSalesByMaterialId(materialId);
        BigDecimal totalRevenue = BigDecimal.ZERO;
        LocalDate lastSaleDate = null;

        if(totalSalesCount > 0){
            totalRevenue = materialRepository.sumRevenueByMaterialId(materialId);
            lastSaleDate = materialRepository.findLastSaleDateByMaterialId(materialId);
        }

        // Recent performance (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = materialRepository.countSalesByMaterialIdAndDateRange(materialId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = materialRepository.sumRevenueByMaterialIdAndDateRange(materialId, thirtyDaysAgo, today);

        // Yearly performance
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Integer yearlySalesCount = materialRepository.countSalesByMaterialIdAndDateRange(materialId, yearStart, today);
        BigDecimal yearlySalesRevenue = materialRepository.sumRevenueByMaterialIdAndDateRange(materialId, yearStart, today);

        return new MaterialAnalyticsDTO(
                totalProductsUsing,
                averageCostPerProduct != null ? averageCostPerProduct : BigDecimal.ZERO,
                purchaseCount,
                lastPurchaseDate,
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
                .filter(Objects::nonNull)
                .sorted((p1, p2) -> p2.costImpact().compareTo(p1.costImpact()))
                .collect(Collectors.toList());
    }

    private ProductUsageDTO getProductMaterialUsage(Long productId, Long materialId, BigDecimal materialCost) {
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);
        String categoryName = productRepository.findCategoryNameByProductId(productId);
        BigDecimal usageQuantity = productRepository.findMaterialQuantityForProduct(productId, materialId);

        if (usageQuantity == null || usageQuantity.compareTo(BigDecimal.ZERO) == 0) {
            return createEmptyProductUsage(productId);
        }

        BigDecimal costImpact = usageQuantity.multiply(materialCost);

        return new ProductUsageDTO(productId, productName, productCode, usageQuantity, costImpact, categoryName);
    }

    private List<CategoryUsageDTO> getCategoryDistribution(Long materialId){
        List<Long> categoryIds = productRepository.findCategoryIdsByMaterialId(materialId);

        if (categoryIds.isEmpty()) {
            return Collections.emptyList();
        }

        Integer totalProducts = productRepository.countProductsByMaterialId(materialId);

        return categoryIds.stream()
                .map(categoryId -> getCategoryUsageForMaterial(categoryId, materialId, totalProducts))
                .filter(Objects::nonNull)
                .sorted((c1, c2) -> c2.productCount().compareTo(c1.productCount()))
                .collect(Collectors.toList());
    }

    private CategoryUsageDTO getCategoryUsageForMaterial(Long categoryId, Long materialId, Integer totalProducts) {
        String categoryName = categoryRepository.findCategoryNameById(categoryId);
        Integer productCount = productRepository.countProductsByCategoryIdAndMaterialId(categoryId, materialId);

        if (productCount == 0) {
            return createEmptyCategoryUsage(categoryId);
        }

        Double percentage = (productCount * 100.0) / totalProducts;

        return new CategoryUsageDTO(categoryId, categoryName, productCount, percentage);
    }

    private ProductUsageDTO createEmptyProductUsage(Long productId){
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);
        String categoryName = productRepository.findCategoryNameByProductId(productId);

        return new ProductUsageDTO(productId, productName, productCode, BigDecimal.ZERO, BigDecimal.ZERO, categoryName);
    }

    private CategoryUsageDTO createEmptyCategoryUsage(Long categoryId){
        String categoryName = categoryRepository.findCategoryNameById(categoryId);
        return new CategoryUsageDTO(categoryId, categoryName, 0, 0.0);
    }

    /**
     * Helper method to map Object[] to ProductUsageDTO list
     */
    private List<ProductUsageDTO> mapToProductUsageDTOs(List<Object[]> data) {
        return data.stream()
                .map(row -> new ProductUsageDTO(
                        ((Number) row[0]).longValue(), // productId
                        (String) row[1], // productName
                        (String) row[2], // productCode
                        (BigDecimal) row[3], // quantity
                        (BigDecimal) row[4], // costImpact
                        (String) row[5] // categoryName
                ))
                .collect(Collectors.toList());
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

