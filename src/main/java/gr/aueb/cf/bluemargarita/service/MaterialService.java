package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.MaterialSpecification;
import gr.aueb.cf.bluemargarita.dto.material.MaterialDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialInsertDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialUpdateDTO;
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

        if (!material.getAllPurchaseMaterials().isEmpty() || !material.getAllProductMaterials().isEmpty()) {
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

    // =============================================================================
    // ANALYTICS AND DETAILED VIEWS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public MaterialDetailedViewDTO getMaterialDetailedById(Long id) throws EntityNotFoundException {

        LOGGER.debug("Retrieving optimized detailed analytics for material id: {}", id);

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + id + " was not found"));

        Integer totalProductsUsing = materialRepository.countProductsUsingMaterial(id);

        if (totalProductsUsing == 0) {
            // No products using this material - return empty metrics
            return createEmptyMetricsDTO(material);
        }

        // Get usage statistics using repository aggregation
        Object[] usageStats = materialRepository.calculateUsageStatsByMaterialId(id);
        BigDecimal averageUsageQuantity = usageStats != null && usageStats[0] != null ?
                (BigDecimal) usageStats[0] : BigDecimal.ZERO;
        BigDecimal minUsageQuantity = usageStats != null && usageStats[1] != null ?
                (BigDecimal) usageStats[1] : BigDecimal.ZERO;
        BigDecimal maxUsageQuantity = usageStats != null && usageStats[2] != null ?
                (BigDecimal) usageStats[2] : BigDecimal.ZERO;


        BigDecimal averageCostPerProduct = materialRepository.calculateAverageCostPerProductByMaterialId(id);
        if (averageCostPerProduct == null) {
            averageCostPerProduct = BigDecimal.ZERO;
        }

        // Get top products using this material (limit to 10 for performance)
        PageRequest topProductsPageable = PageRequest.of(0, 10);
        List<Object[]> topProductsData = materialRepository.findTopProductsByMaterialUsage(id, topProductsPageable);

        List<ProductUsageDTO> topProductsUsage = topProductsData.stream()
                .map(data -> new ProductUsageDTO(
                        (Long) data[0],           // productId
                        (String) data[1],         // productName
                        (String) data[2],         // productCode
                        (BigDecimal) data[3],     // usageQuantity (for materials)
                        (BigDecimal) data[4],     // costImpact (quantity * cost per unit)
                        (String) data[5]          // categoryName
                ))
                .collect(Collectors.toList());

        LOGGER.debug("Optimized analytics completed for material '{}': totalProducts={}, avgUsage={}, , topProducts={}",
                material.getName(), totalProductsUsing, averageUsageQuantity,  topProductsUsage.size());

        return new MaterialDetailedViewDTO(
                material.getId(),
                material.getName(),
                material.getUnitOfMeasure(),
                material.getCurrentUnitCost(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getCreatedBy().getUsername(),
                material.getLastUpdatedBy().getUsername(),
                material.getIsActive(),
                material.getDeletedAt(),
                totalProductsUsing,
                averageUsageQuantity,
                minUsageQuantity,
                maxUsageQuantity,
                averageCostPerProduct,
                topProductsUsage
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

    private MaterialDetailedViewDTO createEmptyMetricsDTO(Material material){
        return new MaterialDetailedViewDTO(
                material.getId(),
                material.getName(),
                material.getUnitOfMeasure(),
                material.getCurrentUnitCost(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getCreatedBy().getUsername(),
                material.getLastUpdatedBy().getUsername(),
                material.getIsActive(),
                material.getDeletedAt(),
                0,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                Collections.emptyList()
        );
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

