package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.PurchaseFilters;
import gr.aueb.cf.bluemargarita.core.specifications.PurchaseSpecification;
import gr.aueb.cf.bluemargarita.dto.material.MaterialSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.*;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PurchaseService implements IPurchaseService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PurchaseService.class);
    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public PurchaseService(PurchaseRepository purchaseRepository,
                           SupplierRepository supplierRepository,
                           MaterialRepository materialRepository,
                           UserRepository userRepository,
                           Mapper mapper) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PurchaseDetailedViewDTO recordPurchase(RecordPurchaseRequestDTO request) throws EntityNotFoundException {

        LOGGER.info("Recording new purchase from supplier {} with {} materials",
                request.supplierId(), request.materials().size());

        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + request.supplierId() + " was not found"));

        // Validate creator user exists
        User creator = userRepository.findById(request.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + request.creatorUserId() + " was not found"));

        // Validate all materials exist and build material-quantity map
        Map<Material, BigDecimal> materialQuantityMap = validateAndBuildMaterialMap(request.materials());

        // Create purchase entity
        Purchase purchase = Purchase.builder()
                .supplier(supplier)
                .purchaseDate(request.purchaseDate())
                .totalCost(BigDecimal.ZERO) // Will be calculated
                .build();

        purchase.setCreatedBy(creator);
        purchase.setLastUpdatedBy(creator);

        // Save purchase first to get ID
        purchase = purchaseRepository.save(purchase);

        // Add materials to purchase and calculate total cost
        BigDecimal totalCost = BigDecimal.ZERO;
        for (Map.Entry<Material, BigDecimal> entry : materialQuantityMap.entrySet()) {
            Material material = entry.getKey();
            BigDecimal quantity = entry.getValue();

            purchase.addMaterial(material, quantity);

            // Calculate line cost
            BigDecimal lineCost = material.getCurrentUnitCost() != null ?
                    material.getCurrentUnitCost().multiply(quantity) : BigDecimal.ZERO;
            totalCost = totalCost.add(lineCost);

            LOGGER.debug("Added material {} (quantity: {}, unit cost: {}, line total: {}) to purchase",
                    material.getName(), quantity, material.getCurrentUnitCost(), lineCost);
        }

        // Update total cost
        purchase.setTotalCost(totalCost);

        // Save purchase with materials and total cost
        Purchase savedPurchase = purchaseRepository.save(purchase);

        LOGGER.info("Purchase recorded with id: {}, total cost: {}", savedPurchase.getId(), totalCost);

        return mapToPurchaseDetailedViewDTO(savedPurchase);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PurchaseReadOnlyDTO updatePurchase(PurchaseUpdateDTO dto) throws EntityNotFoundException {

        Purchase existingPurchase = purchaseRepository.findById(dto.purchaseId())
                .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + dto.purchaseId() + " was not found"));

        // Validate supplier if changed
        if (!existingPurchase.getSupplier().getId().equals(dto.supplierId())) {
            Supplier newSupplier = supplierRepository.findById(dto.supplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + dto.supplierId() + " was not found"));
            existingPurchase.setSupplier(newSupplier);
        }

        // Update fields
        existingPurchase.setPurchaseDate(dto.purchaseDate());

        // Update audit fields
        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + dto.updaterUserId() + " was not found"));
        existingPurchase.setLastUpdatedBy(updater);

        Purchase savedPurchase = purchaseRepository.save(existingPurchase);

        LOGGER.info("Purchase {} updated", savedPurchase.getId());

        return mapper.mapToPurchaseReadOnlyDTO(savedPurchase);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePurchase(Long purchaseId) throws EntityNotFoundException {

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + purchaseId + " was not found"));

        // Hard delete - purchases can be deleted completely
        purchaseRepository.delete(purchase);

        LOGGER.info("Purchase {} deleted", purchaseId);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseDetailedViewDTO getPurchaseDetailedView(Long purchaseId) throws EntityNotFoundException {

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + purchaseId + " was not found"));

        return mapToPurchaseDetailedViewDTO(purchase);
    }

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<PurchaseReadOnlyDTO> getPurchasesFilteredPaginated(PurchaseFilters filters) {

        Page<Purchase> filtered = purchaseRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );

        return new Paginated<>(filtered.map(mapper::mapToPurchaseReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseReadOnlyDTO> getFilteredPurchases(PurchaseFilters filters) {
        return purchaseRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToPurchaseReadOnlyDTO)
                .collect(Collectors.toList());
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
                        material.getCurrentUnitCost(),
                        "N/A" // Could add primary supplier if needed
                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseReadOnlyDTO> getRecentPurchases(int limit) {
        return purchaseRepository.findAll(
                        PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "purchaseDate", "createdAt"))
                )
                .stream()
                .map(mapper::mapToPurchaseReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchasesSummaryDTO getDailyPurchasesSummary() {
        LOGGER.debug("Retrieving optimized daily purchases summary");
        LocalDate today = LocalDate.now();

        // Use repository aggregation for performance
        Integer count = purchaseRepository.countPurchasesByDateRange(today, today);
        BigDecimal totalCost = purchaseRepository.sumCostByDateRange(today, today);

        BigDecimal averagePurchaseValue = count != null && count > 0 && totalCost != null ?
                totalCost.divide(BigDecimal.valueOf(count), 2, BigDecimal.ROUND_HALF_UP) :
                BigDecimal.ZERO;

        // Get material statistics
        Integer totalMaterialItems = purchaseRepository.countMaterialItemsByDateRange(today, today);
        BigDecimal averageItemCost = totalMaterialItems != null && totalMaterialItems > 0 && totalCost != null ?
                totalCost.divide(BigDecimal.valueOf(totalMaterialItems), 2, BigDecimal.ROUND_HALF_UP) :
                BigDecimal.ZERO;

        return new PurchasesSummaryDTO(
                count != null ? count : 0,
                totalCost != null ? totalCost : BigDecimal.ZERO,
                averagePurchaseValue,
                totalMaterialItems != null ? totalMaterialItems : 0,
                averageItemCost
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Maps Purchase entity to PurchaseDetailedViewDTO with complete cost calculations
     * Following the same pattern as ProductService.mapToProductDetailsDTO()
     */
    private PurchaseDetailedViewDTO mapToPurchaseDetailedViewDTO(Purchase purchase) {

        List<PurchaseMaterialDetailDTO> materials = purchase.getAllPurchaseMaterials().stream()
                .map(pm -> {
                    BigDecimal lineTotal = pm.getQuantity().multiply(pm.getPriceAtTheTime());
                    BigDecimal costDifference = pm.getPriceAtTheTime().subtract(
                            pm.getMaterial().getCurrentUnitCost() != null ?
                                    pm.getMaterial().getCurrentUnitCost() : BigDecimal.ZERO);

                    return new PurchaseMaterialDetailDTO(
                            pm.getMaterial().getId(),
                            pm.getMaterial().getName(),
                            pm.getMaterial().getUnitOfMeasure(),
                            pm.getQuantity(),
                            pm.getPriceAtTheTime(),
                            pm.getMaterial().getCurrentUnitCost(),
                            lineTotal,
                            costDifference
                    );
                })
                .collect(Collectors.toList());

        BigDecimal totalItemCount = purchase.getAllPurchaseMaterials().stream()
                .map(PurchaseMaterial::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PurchaseDetailedViewDTO(
                purchase.getId(),
                purchase.getPurchaseDate(),
                purchase.getSupplier().getName(),
                purchase.getSupplier().getEmail() + " / " + purchase.getSupplier().getPhoneNumber(),
                purchase.getTotalCost(),
                totalItemCount.intValue(),
                materials,
                purchase.getCreatedAt(),
                purchase.getCreatedBy().getUsername(),
                "Purchase from " + purchase.getSupplier().getName()
        );
    }

    /**
     * Validates materials exist and builds material-quantity map
     */
    private Map<Material, BigDecimal> validateAndBuildMaterialMap(Map<Long, BigDecimal> materialQuantities)
            throws EntityNotFoundException {

        return materialQuantities.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> {
                            Long materialId = entry.getKey();
                            try {
                                return materialRepository.findById(materialId)
                                        .orElseThrow(() -> new EntityNotFoundException("Material",
                                                "Material with id=" + materialId + " was not found"));
                            } catch (EntityNotFoundException e) {
                                throw new RuntimeException(e);
                            }
                        },
                        Map.Entry::getValue
                ));
    }

    /**
     * Creates JPA Specification from filter criteria
     */
    private Specification<Purchase> getSpecsFromFilters(PurchaseFilters filters) {
        return Specification
                .where(PurchaseSpecification.purchaseDateBetween(filters.getPurchaseDateFrom(), filters.getPurchaseDateTo()))
                .and(PurchaseSpecification.purchaseSupplierId(filters.getSupplierId()))
                .and(PurchaseSpecification.purchaseSupplierNameLike(filters.getSupplierName()))
                .and(PurchaseSpecification.purchaseTotalCostBetween(filters.getMinCost(), filters.getMaxCost()))
                .and(PurchaseSpecification.purchaseContainsMaterial(filters.getMaterialName()));
    }
}
