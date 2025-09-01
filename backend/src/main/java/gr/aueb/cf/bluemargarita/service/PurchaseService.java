package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.PurchaseFilters;
import gr.aueb.cf.bluemargarita.core.specifications.PurchaseSpecification;
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
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class PurchaseService implements IPurchaseService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PurchaseService.class);
    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final MaterialRepository materialRepository;
    private final UserService userService;
    private final ExpenseRepository expenseRepository;
    private final IExpenseService expenseService;
    private final Mapper mapper;

    @Autowired
    public PurchaseService(PurchaseRepository purchaseRepository,
                           SupplierRepository supplierRepository,
                           MaterialRepository materialRepository,
                           UserService userService,
                           ExpenseRepository expenseRepository,
                           IExpenseService expenseService,
                           Mapper mapper) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.materialRepository = materialRepository;
        this.userService = userService;
        this.expenseRepository = expenseRepository;
        this.expenseService = expenseService;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PurchaseDetailedViewDTO recordPurchase(RecordPurchaseRequestDTO request)
            throws EntityNotFoundException, EntityAlreadyExistsException {

        // Validate supplier and user exists
        Supplier supplier = getSupplierEntityById(request.supplierId());
        User creator = userService.getCurrentUserOrThrow();

        // Validate all materials exist
        validateMaterialsExist(request.materials());

        // Create base purchase entity
        Purchase purchase = createBasePurchase(request, supplier, creator);

        // Save purchase first to get ID
        purchase = purchaseRepository.save(purchase);

        // Add materials and calculate total cost (separate method)
        BigDecimal totalCost = addMaterialsToPurchaseAndCalculateCost(purchase, request.materials());

        // Update total cost
        purchase.setTotalCost(totalCost);

        // Save purchase with materials and total cost
        Purchase savedPurchase = purchaseRepository.save(purchase);

        String expenseDescription = createExpenseDescription(purchase);
        expenseService.createPurchaseExpense(
                savedPurchase.getId(),
                expenseDescription,
                totalCost,
                savedPurchase.getPurchaseDate()
        );

        LOGGER.info("Purchase recorded with id: {}, total cost: {}", savedPurchase.getId(), totalCost);

        return mapper.mapToPurchaseDetailedViewDTO(savedPurchase);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PurchaseReadOnlyDTO updatePurchase(PurchaseUpdateDTO dto) throws EntityNotFoundException,
            EntityAlreadyExistsException {

        Purchase existingPurchase = getPurchaseEntityById(dto.purchaseId());

        // Validate supplier if changed
        Supplier supplier = validateSupplierIfChanged(existingPurchase, dto.supplierId());

        User updater = userService.getCurrentUserOrThrow();

        updatePurchaseBasicFields(existingPurchase, dto, supplier, updater);

        Purchase savedPurchase = purchaseRepository.save(existingPurchase);

        expenseService.updatePurchaseExpense(
                savedPurchase.getId(),
                savedPurchase.getTotalCost(),
                savedPurchase.getPurchaseDate()
        );

        LOGGER.info("Purchase {} updated", savedPurchase.getId());

        return mapper.mapToPurchaseReadOnlyDTO(savedPurchase);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePurchase(Long purchaseId) throws EntityNotFoundException {

        Purchase purchase = getPurchaseEntityById(purchaseId);

        Expense expense = expenseRepository.findByPurchaseId(purchaseId);
        if(expense != null) {
            expenseService.deleteExpense(expense.getId());
            LOGGER.info("Deleted expense for purchase {}", purchaseId);
        }

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

        // Only calculate summary if total results are 100 or less (performance optimization)
        if(totalFilteredResults <= 100) {
            summary = calculatePurchaseSummary(filters);
        }

        return new PaginatedFilteredPurchasesWithSummary(filtered, summary);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseDetailedViewDTO getPurchaseDetailedView(Long purchaseId) throws EntityNotFoundException {

        Purchase purchase = getPurchaseEntityById(purchaseId);

        return mapper.mapToPurchaseDetailedViewDTO(purchase);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Purchase getPurchaseEntityById(Long id) throws EntityNotFoundException {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase",
                        "Purchase with id=" + id + " was not found"));
    }

    private Supplier getSupplierEntityById(Long id) throws EntityNotFoundException {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier",
                        "Supplier with id=" + id + " was not found"));
    }

    private Material getMaterialEntityById(Long id) throws EntityNotFoundException {
        return materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material",
                        "Material with id=" + id + " was not found"));
    }

    private String createExpenseDescription(Purchase purchase){
        if(purchase.getSupplier() != null){
            return "Αγορά από " + purchase.getSupplier().getName() + " - " + purchase.getPurchaseDate();
        }
        return "Αγορά " + purchase.getId() + " - " + purchase.getPurchaseDate();
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Validation
    // =============================================================================

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

    private Supplier validateSupplierIfChanged(Purchase existing, Long newSupplierId) throws EntityNotFoundException {
        if (!existing.getSupplier().getId().equals(newSupplierId)) {
            return getSupplierEntityById(newSupplierId);
        }
        return null;
    }

    private PurchaseSummaryDTO calculatePurchaseSummary(PurchaseFilters filters){

        Integer totalCount = countPurchasesByFilters(filters);

        if(totalCount == 0){
            return new PurchaseSummaryDTO(0,BigDecimal.ZERO);
        }

        BigDecimal totalRevenue = sumTotalCostByFilters(filters);

        LOGGER.debug("Summary calculated: count={}, revenue={}", totalCount, totalRevenue);

        return new PurchaseSummaryDTO(
                totalCount,
                totalRevenue
        );
    }


    // =============================================================================
    // PRIVATE HELPER METHODS - Purchase Creation and Management
    // =============================================================================

    private Purchase createBasePurchase(RecordPurchaseRequestDTO request, Supplier supplier, User creator) {
        Purchase purchase = Purchase.builder()
                .supplier(supplier)
                .purchaseDate(request.purchaseDate())
                .totalCost(BigDecimal.ZERO) // Will be calculated
                .build();

        purchase.setCreatedBy(creator);
        purchase.setLastUpdatedBy(creator);

        return purchase;
    }

    private BigDecimal addMaterialsToPurchaseAndCalculateCost(Purchase purchase,
                                                              List<PurchaseMaterialRequestDTO> materials)
            throws EntityNotFoundException {

        BigDecimal totalCost = BigDecimal.ZERO;

        for (PurchaseMaterialRequestDTO materialRequest : materials) {
            // Get material entity
            Material material = getMaterialEntityById(materialRequest.materialId());

            // Add material to purchase
            purchase.addMaterial(material, materialRequest.quantity(), materialRequest.pricePerUnit());

            // Calculate line cost using user-entered price
            BigDecimal lineCost = materialRequest.pricePerUnit().multiply(materialRequest.quantity());
            totalCost = totalCost.add(lineCost);

            LOGGER.debug("Added material {} (quantity: {}, user price: {}, line total: {}) to purchase",
                    material.getName(), materialRequest.quantity(), materialRequest.pricePerUnit(), lineCost);
        }

        return totalCost;
    }

    private void updatePurchaseBasicFields(Purchase purchase, PurchaseUpdateDTO dto,
                                           Supplier supplier, User updater) {
        if (supplier != null) {
            purchase.setSupplier(supplier);
        }
        purchase.setPurchaseDate(dto.purchaseDate());
        purchase.setLastUpdatedBy(updater);
    }


    private Integer countPurchasesByFilters(PurchaseFilters filters) {
        Specification<Purchase> spec = getSpecsFromFilters(filters);
        return (int) purchaseRepository.count(spec);
    }

    private BigDecimal sumTotalCostByFilters(PurchaseFilters filters) {
        Specification<Purchase> spec = getSpecsFromFilters(filters);
        List<Purchase> purchases = purchaseRepository.findAll(spec);

        return purchases.stream()
                .map(Purchase::getTotalCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


    private Specification<Purchase> getSpecsFromFilters(PurchaseFilters filters) {

        return Specification
                .where(PurchaseSpecification.purchaseDateBetween(filters.getPurchaseDateFrom(), filters.getPurchaseDateTo()))
                .and(PurchaseSpecification.purchaseSupplierId(filters.getSupplierId()))
                .and(PurchaseSpecification.purchaseContainsMaterialId(filters.getMaterialId()));

    }
}
