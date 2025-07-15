package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.MaterialSpecification;
import gr.aueb.cf.bluemargarita.dto.material.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Material;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.MaterialRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialService implements IMaterialService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MaterialService.class);
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public MaterialService(MaterialRepository materialRepository, UserRepository userRepository, Mapper mapper) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialReadOnlyDTO createMaterial(MaterialInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (materialRepository.existsByDescription(dto.name())) {
            throw new EntityAlreadyExistsException("Material", "Material with description " + dto.name() + " already exists");
        }

        Material material = mapper.mapMaterialInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        material.setCreatedBy(creator);
        material.setLastUpdatedBy(creator);

        Material insertedMaterial = materialRepository.save(material);

        LOGGER.info("Material created with id: {}", insertedMaterial.getId());

        return mapper.mapToMaterialReadOnlyDTO(insertedMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialReadOnlyDTO updateMaterial(MaterialUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Material existingMaterial = materialRepository.findById(dto.materialId())
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + dto.materialId() + " was not found"));

        if (!existingMaterial.getName().equals(dto.name()) && materialRepository.existsByDescription(dto.name())) {
            throw new EntityAlreadyExistsException("Material", "Material with description " + dto.name() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Material updatedMaterial = mapper.mapMaterialUpdateToModel(dto, existingMaterial);
        updatedMaterial.setLastUpdatedBy(updater);

        Material savedMaterial = materialRepository.save(updatedMaterial);

        LOGGER.info("Material {} updated by user {}", savedMaterial.getName(), updater.getUsername());

        return mapper.mapToMaterialReadOnlyDTO(savedMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) throws EntityNotFoundException {

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + id + " was not found"));

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

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + id + " was not found"));

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
    public MaterialDetailedViewDTO getMaterialDetailedById(Long id) throws EntityNotFoundException {

        LOGGER.debug("Retrieving optimized analytics for material id: {}", id);

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + id + " was not found"));

        // Basic metrics using single queries (following LocationService pattern)
        Integer totalProductsUsing = materialRepository.countProductsUsingMaterial(id);

        if (totalProductsUsing == 0) {
            // No products using this material - return empty metrics
            return createEmptyMaterialMetricsDTO(material);
        }

        // Get aggregated data in single queries (no loading all entities into memory)
        Object[] usageStats = materialRepository.calculateUsageStatsByMaterialId(id);
        BigDecimal avgCostPerProduct = materialRepository.calculateAverageCostPerProductByMaterialId(id);

        // Purchase analytics using simple queries
        Integer purchaseCount = materialRepository.countPurchasesContainingMaterial(id);
        LocalDate lastPurchaseDate = materialRepository.findLastPurchaseDateByMaterialId(id);

        // Calculate usage statistics from Object array
        BigDecimal avgUsage = usageStats[0] != null ? (BigDecimal) usageStats[0] : BigDecimal.ZERO;
        BigDecimal minUsage = usageStats[1] != null ? (BigDecimal) usageStats[1] : BigDecimal.ZERO;
        BigDecimal maxUsage = usageStats[2] != null ? (BigDecimal) usageStats[2] : BigDecimal.ZERO;

        // Get top products using this material (limited to 5, using aggregated query)
        List<Object[]> topProductsData = materialRepository.findTopProductsByMaterialUsage(id, PageRequest.of(0, 5));
        List<ProductUsageDTO> topProducts = mapToProductUsageDTOs(topProductsData);

        LOGGER.debug("Optimized analytics completed for material '{}': productsUsing={}, purchaseCount={}",
                material.getName(), totalProductsUsing, purchaseCount);

        return new MaterialDetailedViewDTO(
                material.getId(),
                material.getName(),
                material.getUnitOfMeasure(),
                material.getCurrentUnitCost(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getCreatedBy() != null ? material.getCreatedBy().getUsername() : "system",
                material.getLastUpdatedBy() != null ? material.getLastUpdatedBy().getUsername() : "system",
                material.getIsActive(),
                material.getDeletedAt(),
                totalProductsUsing,
                avgUsage,
                minUsage,
                maxUsage,
                avgCostPerProduct != null ? avgCostPerProduct : BigDecimal.ZERO,
                purchaseCount != null ? purchaseCount : 0,
                lastPurchaseDate,
                topProducts
        );
    }

    // =============================================================================
    // PRODUCT RELATIONSHIP OPERATIONS
    // =============================================================================

    @Transactional(readOnly = true)
    public Paginated<ProductUsageDTO> getAllProductsUsingMaterial(Long materialId, Pageable pageable)
            throws EntityNotFoundException {

        // Verify material exists
        materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + materialId + " was not found"));

        // Apply default sorting if none specified
        if (pageable.getSort().isUnsorted()) {
            // Default: Sort by cost impact (quantity * cost) descending
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "costImpact")
            );
        }

        Page<Object[]> productData = materialRepository.findAllProductsByMaterialUsagePaginated(materialId, pageable);

        Page<ProductUsageDTO> mappedProducts = productData.map(data -> new ProductUsageDTO(
                (Long) data[0],           // productId
                (String) data[1],         // productName
                (String) data[2],         // productCode
                (BigDecimal) data[3],     // usageQuantity
                (BigDecimal) data[4],     // costImpact
                (String) data[5]          // categoryName
        ));

        return new Paginated<>(mappedProducts);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Creates empty metrics DTO for materials with no product usage
     */

    /**
     * Helper method to create empty metrics DTO when no products use the material
     */
    private MaterialDetailedViewDTO createEmptyMaterialMetricsDTO(Material material) {
        return new MaterialDetailedViewDTO(
                material.getId(),
                material.getName(),
                material.getUnitOfMeasure(),
                material.getCurrentUnitCost(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getCreatedBy() != null ? material.getCreatedBy().getUsername() : "system",
                material.getLastUpdatedBy() != null ? material.getLastUpdatedBy().getUsername() : "system",
                material.getIsActive(),
                material.getDeletedAt(),
                0, // totalProductsUsing
                BigDecimal.ZERO, // avgUsage
                BigDecimal.ZERO, // minUsage
                BigDecimal.ZERO, // maxUsage
                BigDecimal.ZERO, // avgCostPerProduct
                0, // purchaseCount
                null, // lastPurchaseDate
                Collections.emptyList() // topProducts
        );
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

