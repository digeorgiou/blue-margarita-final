package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.PurchaseFilters;
import gr.aueb.cf.bluemargarita.core.specifications.PurchaseSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.SaleSpecification;
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
import java.util.*;
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

        // Validate all materials exist
        validateMaterialsExist(request.materials());

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

        // Add materials to purchase and calculate total cost using user-entered prices
        BigDecimal totalCost = BigDecimal.ZERO;
        for (PurchaseMaterialRequestDTO materialRequest : request.materials()) {

            // Fetch material entity
            Material material = materialRepository.findById(materialRequest.materialId())
                    .orElseThrow(() -> new EntityNotFoundException("Material",
                            "Material with id=" + materialRequest.materialId() + " was not found"));

            purchase.addMaterial(material, materialRequest.quantity(), materialRequest.pricePerUnit());

            // Calculate line cost using user-entered price
            BigDecimal lineCost = materialRequest.pricePerUnit().multiply(materialRequest.quantity());
            totalCost = totalCost.add(lineCost);

            LOGGER.debug("Added material {} (quantity: {}, user price: {}, line total: {}) to purchase",
                    material.getName(), materialRequest.quantity(), materialRequest.pricePerUnit(), lineCost);
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

    // =============================================================================
    // VIEW PURCHASES PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public PaginatedFilteredPurchasesWithSummary searchPurchasesWithSummary(PurchaseFilters filters){

        Page<PurchaseReadOnlyDTO> filtered = purchaseRepository.findAll(getSpecsFromFilters(filters), filters.getPageable())
                .map(mapper::mapToPurchaseReadOnlyDTO);

        long totalFilteredResults = filtered.getTotalElements();
        PurchaseSummaryDTO summary = null;

        if(totalFilteredResults <= 100) {
            List<Purchase> allFilteredPurchases = purchaseRepository.findAll(getSpecsFromFilters(filters));

            int totalCount = allFilteredPurchases.size();

            summary = calculatePurchaseSummary(filters);
        }

        return new PaginatedFilteredPurchasesWithSummary(filtered, summary);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseDetailedViewDTO getPurchaseDetailedView(Long purchaseId) throws EntityNotFoundException {

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + purchaseId + " was not found"));

        return mapToPurchaseDetailedViewDTO(purchase);
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
     * Validates that all materials in the request exist
     */
    private void validateMaterialsExist(List<PurchaseMaterialRequestDTO> materials) throws EntityNotFoundException {
        List<Long> materialIds = materials.stream()
                .map(PurchaseMaterialRequestDTO::materialId)
                .toList();

        List<Material> foundMaterials = materialRepository.findAllById(materialIds);

        if (foundMaterials.size() != materialIds.size()) {
            Set<Long> foundIds = foundMaterials.stream().map(Material::getId).collect(Collectors.toSet());
            List<Long> missingIds = materialIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new EntityNotFoundException("Material", "Materials with ids=" + missingIds + " were not found");
        }
    }

    private PurchaseSummaryDTO calculatePurchaseSummary(PurchaseFilters filters){
        LOGGER.debug("Calculating purchases summary with optimized repository queries");

        Integer totalCount = purchaseRepository.countPurchasesByFilters(filters);

        if(totalCount == 0){
            return new PurchaseSummaryDTO(0,BigDecimal.ZERO);
        }

        BigDecimal totalRevenue =purchaseRepository.sumRevenueByFilters(filters);

        LOGGER.debug("Summary calculated: count={}, revenue={}", totalCount, totalRevenue);

        return new PurchaseSummaryDTO(
                totalCount,
                totalRevenue
        );
    }

    /**
     * Creates JPA Specification from filter criteria
     */
    private Specification<Purchase> getSpecsFromFilters(PurchaseFilters filters) {
        Specification<Purchase> spec =  Specification
                .where(PurchaseSpecification.purchaseDateBetween(filters.getPurchaseDateFrom(), filters.getPurchaseDateTo()));

        if(filters.getMaterialId() != null){
            spec = spec.and(PurchaseSpecification.purchaseContainsMaterialId(filters.getMaterialId()));
        }else if (filters.getMaterialName() != null && !filters.getMaterialName().trim().isEmpty()) {
            spec = spec.and(PurchaseSpecification.purchaseContainsMaterial(filters.getMaterialName()));
        }

        if(filters.getSupplierId() != null){
            spec = spec.and(PurchaseSpecification.purchaseSupplierId(filters.getSupplierId()));
        }else if (filters.getSupplierNameOrTinOrEmail() != null && !filters.getSupplierNameOrTinOrEmail().trim().isEmpty()) {
            spec = spec.and(PurchaseSpecification.purchaseSupplierNameOrTinOrEmailLike(filters.getSupplierNameOrTinOrEmail()));
        }

        return spec;

    }
}
