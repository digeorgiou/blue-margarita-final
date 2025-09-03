package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.core.specifications.SupplierSpecification;
import gr.aueb.cf.bluemargarita.dto.supplier.*;
import gr.aueb.cf.bluemargarita.dto.material.MaterialStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Supplier;
import gr.aueb.cf.bluemargarita.model.User;
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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService implements ISupplierService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SupplierService.class);
    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;
    private final PurchaseMaterialRepository purchaseMaterialRepository;
    private final UserService userService;
    private final MaterialRepository materialRepository;
    private final Mapper mapper;

    @Autowired
    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseRepository purchaseRepository,
                           PurchaseMaterialRepository purchaseMaterialRepository,
                           UserService userService,
                           MaterialRepository materialRepository,
                           Mapper mapper) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
        this.purchaseMaterialRepository = purchaseMaterialRepository;
        this.userService = userService;
        this.materialRepository = materialRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO createSupplier(SupplierInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Supplier supplier = mapper.mapSupplierInsertToModel(dto);

        validateUniqueName(supplier.getName());
        validateUniqueTin(supplier.getTin());
        validateUniqueEmail(supplier.getEmail());
        validateUniquePhoneNumber(supplier.getPhoneNumber());

        User creator = userService.getCurrentUserOrThrow();

        supplier.setCreatedBy(creator);
        supplier.setLastUpdatedBy(creator);

        Supplier insertedSupplier = supplierRepository.save(supplier);

        LOGGER.info("Supplier created with id: {}", insertedSupplier.getId());

        return mapper.mapToSupplierReadOnlyDTO(insertedSupplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO updateSupplier(SupplierUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Supplier existingSupplier = getSupplierEntityById(dto.supplierId());

        if (dto.name() != null && !dto.name().equals(existingSupplier.getName())){
            validateUniqueName(dto.name());
        }

        if (dto.tin() != null && !dto.tin().equals(existingSupplier.getTin())){
            validateUniqueTin(dto.tin());
        }

        if (dto.email() != null && !dto.email().equals(existingSupplier.getEmail())){
            validateUniqueEmail(dto.email());
        }

        if (dto.phoneNumber() != null && !dto.phoneNumber().equals(existingSupplier.getPhoneNumber())){
            validateUniquePhoneNumber(dto.phoneNumber());
        }

        User updater = userService.getCurrentUserOrThrow();

        Supplier updatedSupplier = mapper.mapSupplierUpdateToModel(dto, existingSupplier);
        updatedSupplier.setLastUpdatedBy(updater);

        Supplier savedSupplier = supplierRepository.save(updatedSupplier);

        LOGGER.info("Supplier {} updated by user {}", savedSupplier.getName(), updater.getUsername());

        return mapper.mapToSupplierReadOnlyDTO(savedSupplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSupplier(Long id) throws EntityNotFoundException {

        Supplier supplier = getSupplierEntityById(id);

        Integer purchaseCount = purchaseRepository.countBySupplierId(id);

        if (purchaseCount > 0) {
            // Soft Delete if supplier has purchase history
            supplier.setIsActive(false);
            supplier.setDeletedAt(LocalDateTime.now());
            supplierRepository.save(supplier);

            LOGGER.info("Supplier {} soft deleted. Used in {} purchases",
                    supplier.getName(), supplier.getAllPurchases().size());
        } else {
            // Hard delete if supplier not used anywhere
            supplierRepository.delete(supplier);
            LOGGER.info("Supplier {} hard deleted (not used in any purchases)", supplier.getName());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO restoreSupplier(Long id) throws EntityNotFoundException, EntityInvalidArgumentException {

        Supplier supplier = getSupplierEntityById(id);

        // Check if supplier is actually soft-deleted
        if (supplier.getIsActive()) {
            throw new EntityInvalidArgumentException("Supplier", "Supplier is already active and cannot be restored");
        }

        // Restore the supplier
        supplier.setIsActive(true);
        supplier.setDeletedAt(null);

        User currentUser = userService.getCurrentUserOrThrow();
        supplier.setLastUpdatedBy(currentUser);

        Supplier restoredSupplier = supplierRepository.save(supplier);

        LOGGER.info("Supplier {} restored by user {}",
                restoredSupplier.getName(),
                currentUser.getUsername());

        return mapper.mapToSupplierReadOnlyDTO(restoredSupplier);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierReadOnlyDTO getSupplierById(Long id) throws EntityNotFoundException {

        Supplier supplier = getSupplierEntityById(id);

        return mapper.mapToSupplierReadOnlyDTO(supplier);
    }

    // =============================================================================
    // DROPDOWN FOR RECORD PURCHASE
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDropdownDTO> getActiveSuppliersForDropdown() {
        return supplierRepository.findByIsActiveTrue()
                .stream()
                .map(supplier -> new SupplierDropdownDTO(supplier.getId(), supplier.getName()))
                .sorted((s1, s2) -> s1.name().compareToIgnoreCase(s2.name()))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // SEARCH SUPPLIER - AUTOCOMPLETE
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<SupplierSearchResultDTO> searchSuppliersForAutocomplete(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            return Collections.emptyList();
        }

        Specification<Supplier> spec = Specification
                .where(SupplierSpecification.supplierNameOrTinOrEmailLike(searchTerm.trim()))
                .and(SupplierSpecification.supplierIsActive(true));

        return supplierRepository.findAll(spec)
                .stream()
                .limit(10)
                .map(supplier -> new SupplierSearchResultDTO(
                        supplier.getId(),
                        supplier.getName(),
                        supplier.getTin(),
                        supplier.getEmail(),
                        supplier.getPhoneNumber()
                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // MANAGEMENT PAGE - ANALYTICS VIEW
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<SupplierReadOnlyDTO> getSuppliersFilteredPaginated(SupplierFilters filters) {
        var filtered = supplierRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToSupplierReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDetailedViewDTO getSupplierDetailedView(Long supplierId) throws EntityNotFoundException {

        Supplier supplier = getSupplierEntityById(supplierId);

        SupplierAnalyticsDTO analytics = getSupplierAnalytics(supplierId);

        List<MaterialStatsSummaryDTO> topMaterials = getTopMaterialsBySupplier(supplierId);

        return  mapper.mapToSupplierDetailedView(supplier, analytics, topMaterials);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Supplier getSupplierEntityById(Long supplierId) throws EntityNotFoundException {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id " + supplierId + " not found"));
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if( name != null && supplierRepository.existsByName(name)){
            throw new EntityAlreadyExistsException("Supplier", "Υπάρχει ήδη προμηθευτής με όνομα " + name);
        }
    }

    private void validateUniqueEmail(String email) throws EntityAlreadyExistsException {
        if (email != null && supplierRepository.existsByEmail(email)) {
            throw new EntityAlreadyExistsException("Supplier", "Υπάρχει ήδη προμηθευτής με email " + email);
        }
    }

    private void validateUniquePhoneNumber(String phoneNumber) throws EntityAlreadyExistsException {
        if(phoneNumber != null && supplierRepository.existsByPhoneNumber(phoneNumber)){
            throw new EntityAlreadyExistsException("Supplier", "Υπάρχει ήδη προμηθευτής με τηλέφωνο " + phoneNumber);
        }
    }

    private void validateUniqueTin(String tin) throws EntityAlreadyExistsException {
        if (tin != null && supplierRepository.existsByTin(tin)) {
            throw new EntityAlreadyExistsException("Supplier", "Υπάρχει ήδη προμηθευτής με ΑΦΜ " + tin);
        }
    }



    // =============================================================================
    // PRIVATE HELPER METHODS - Calculating Analytics
    // =============================================================================

    private SupplierAnalyticsDTO getSupplierAnalytics(Long supplierId){

        Integer totalPurchases = purchaseRepository.countBySupplierId(supplierId);
        if (totalPurchases == 0) {
            return createEmptySupplierAnalytics();
        }

        BigDecimal totalCost = purchaseRepository.sumCostBySupplierId(supplierId);
        LocalDate lastPurchaseDate = purchaseRepository.findLastPurchaseDateBySupplierId(supplierId);

        BigDecimal averagePurchaseValue = totalCost != null && totalPurchases > 0 ?
                totalCost.divide(BigDecimal.valueOf(totalPurchases), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return new SupplierAnalyticsDTO(
                totalPurchases,
                totalCost,
                lastPurchaseDate,
                averagePurchaseValue
        );
    }

    private List<MaterialStatsSummaryDTO> getTopMaterialsBySupplier(Long supplierId) {
        // Get distinct materials purchased from this supplier
        List<Long> materialIds = purchaseMaterialRepository.findDistinctMaterialIdsBySupplierId(supplierId);

        return materialIds.stream()
                .map(materialId -> {
                    String materialName = materialRepository.findMaterialNameById(materialId);
                    BigDecimal totalQuantity = purchaseMaterialRepository.sumQuantityBySupplierIdAndMaterialId(supplierId, materialId);
                    BigDecimal totalCost = purchaseMaterialRepository.sumCostBySupplierIdAndMaterialId(supplierId, materialId);
                    LocalDate lastPurchaseDate = purchaseMaterialRepository.findLastPurchaseDateBySupplierIdAndMaterialId(supplierId, materialId);

                    return new MaterialStatsSummaryDTO(
                            materialId,
                            materialName,
                            totalQuantity,
                            totalCost,
                            lastPurchaseDate
                    );
                })
                .sorted((m1, m2) -> m2.totalCostPaid().compareTo(m1.totalCostPaid())) // Sort by cost descending
                .limit(5)
                .collect(Collectors.toList());
    }


    private SupplierAnalyticsDTO createEmptySupplierAnalytics(){
        return new SupplierAnalyticsDTO(
                0, // totalPurchases
                BigDecimal.ZERO, // totalCost
                null, // lastPurchaseDate
                BigDecimal.ZERO // averagePurchaseValue
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<Supplier> getSpecsFromFilters(SupplierFilters filters) {
        return Specification
                .where(SupplierSpecification.supplierNameLike(filters.getName()))
                .and(SupplierSpecification.supplierEmailLike(filters.getEmail()))
                .and(SupplierSpecification.supplierTinLike(filters.getTin()))
                .and(SupplierSpecification.supplierPhoneNumberLike(filters.getPhoneNumber()))
                .and(SupplierSpecification.supplierAddressLike(filters.getAddress()))
                .and(SupplierSpecification.searchMultipleFields(filters.getSearchTerm()))
                .and(SupplierSpecification.supplierIsActive(filters.getIsActive()));
    }
}