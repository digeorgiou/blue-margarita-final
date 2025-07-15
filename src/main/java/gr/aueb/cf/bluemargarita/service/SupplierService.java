package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.core.specifications.SupplierSpecification;
import gr.aueb.cf.bluemargarita.dto.supplier.*;
import gr.aueb.cf.bluemargarita.dto.material.MaterialStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseReadOnlyDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Supplier;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.SupplierRepository;
import gr.aueb.cf.bluemargarita.repository.PurchaseRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseRepository purchaseRepository,
                           UserRepository userRepository,
                           Mapper mapper) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO createSupplier(SupplierInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        // Validate unique constraints
        if (dto.tin() != null && !dto.tin().trim().isEmpty() && supplierRepository.existsByTin(dto.tin())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with TIN " + dto.tin() + " already exists");
        }

        if (dto.email() != null && !dto.email().trim().isEmpty() && supplierRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with email " + dto.email() + " already exists");
        }

        Supplier supplier = mapper.mapSupplierInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        supplier.setCreatedBy(creator);
        supplier.setLastUpdatedBy(creator);

        Supplier insertedSupplier = supplierRepository.save(supplier);

        LOGGER.info("Supplier created with id: {}", insertedSupplier.getId());

        return mapper.mapToSupplierReadOnlyDTO(insertedSupplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO updateSupplier(SupplierUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Supplier existingSupplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + dto.supplierId() + " was not found"));

        // Validate unique TIN if changed
        if (dto.tin() != null && !dto.tin().equals(existingSupplier.getTin()) && supplierRepository.existsByTin(dto.tin())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with TIN " + dto.tin() + " already exists");
        }

        // Validate unique email if changed
        if (dto.email() != null && !dto.email().equals(existingSupplier.getEmail()) && supplierRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with email " + dto.email() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Supplier updatedSupplier = mapper.mapSupplierUpdateToModel(dto, existingSupplier);
        updatedSupplier.setLastUpdatedBy(updater);

        Supplier savedSupplier = supplierRepository.save(updatedSupplier);

        LOGGER.info("Supplier {} updated by user {}", savedSupplier.getName(), updater.getUsername());

        return mapper.mapToSupplierReadOnlyDTO(savedSupplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSupplier(Long id) throws EntityNotFoundException {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + id + " was not found"));

        Integer purchaseCount = supplierRepository.countPurchasesBySupplierId(id);

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
    @Transactional(readOnly = true)
    public SupplierReadOnlyDTO getSupplierById(Long id) throws EntityNotFoundException {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + id + " was not found"));

        return mapper.mapToSupplierReadOnlyDTO(supplier);
    }

    // =============================================================================
    // QUERY OPERATIONS
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

    @Override
    @Transactional(readOnly = true)
    public List<SupplierReadOnlyDTO> getFilteredSuppliers(SupplierFilters filters) {
        return supplierRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToSupplierReadOnlyDTO)
                .collect(Collectors.toList());
    }

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
    public List<SupplierSearchResultDTO> searchSuppliersForAutocomplete(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            return Collections.emptyList();
        }

        Specification<Supplier> spec = Specification
                .where(SupplierSpecification.supplierNameLike(searchTerm.trim()))
                .and(SupplierSpecification.supplierIsActive(true));

        return supplierRepository.findAll(spec)
                .stream()
                .limit(10)
                .map(supplier -> new SupplierSearchResultDTO(
                        supplier.getId(),
                        supplier.getName(),
                        supplier.getEmail(),
                        supplier.getPhoneNumber()
                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // ANALYTICS AND DETAILED VIEWS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public SupplierDetailedViewDTO getSupplierDetailedView(Long supplierId) throws EntityNotFoundException {

        LOGGER.debug("Retrieving optimized analytics for supplier id: {}", supplierId);

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + supplierId + " was not found"));

        // Basic metrics using single queries (following LocationService pattern)
        Integer totalPurchases = supplierRepository.countPurchasesBySupplierId(supplierId);

        if (totalPurchases == 0) {
            // No purchases - return empty metrics
            return createEmptySupplierMetricsDTO(supplier);
        }

        // Get aggregated data in single queries (no loading all purchases into memory)
        BigDecimal totalCost = supplierRepository.sumTotalCostBySupplierId(supplierId);
        LocalDate lastPurchaseDate = supplierRepository.findLastPurchaseDateBySupplierId(supplierId);

        // Calculate average purchase value
        BigDecimal averagePurchaseValue = totalCost != null && totalPurchases > 0 ?
                totalCost.divide(BigDecimal.valueOf(totalPurchases), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        // Get top materials from this supplier (using aggregated query)
        List<Object[]> topMaterialsData = supplierRepository.findTopMaterialsBySupplierId(supplierId);
        List<MaterialStatsSummaryDTO> topMaterials = mapToMaterialStatsSummaryDTOs(topMaterialsData);

        LOGGER.debug("Optimized analytics completed for supplier '{}': totalPurchases={}, totalCost={}, topMaterials={}",
                supplier.getName(), totalPurchases, totalCost, topMaterials.size());

        return new SupplierDetailedViewDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getTin(),
                supplier.getPhoneNumber(),
                supplier.getEmail(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt(),
                supplier.getCreatedBy() != null ? supplier.getCreatedBy().getUsername() : "system",
                supplier.getLastUpdatedBy() != null ? supplier.getLastUpdatedBy().getUsername() : "system",
                supplier.getIsActive(),
                supplier.getDeletedAt(),
                totalPurchases,
                totalCost != null ? totalCost : BigDecimal.ZERO,
                lastPurchaseDate,
                averagePurchaseValue,
                topMaterials
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierReadOnlyDTO> getAllActiveSuppliers() {
        return supplierRepository.findByIsActiveTrue()
                .stream()
                .map(mapper::mapToSupplierReadOnlyDTO)
                .collect(Collectors.toList());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Helper method to create empty metrics DTO when supplier has no purchases
     */
    private SupplierDetailedViewDTO createEmptySupplierMetricsDTO(Supplier supplier) {
        return new SupplierDetailedViewDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getTin(),
                supplier.getPhoneNumber(),
                supplier.getEmail(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt(),
                supplier.getCreatedBy() != null ? supplier.getCreatedBy().getUsername() : "system",
                supplier.getLastUpdatedBy() != null ? supplier.getLastUpdatedBy().getUsername() : "system",
                supplier.getIsActive(),
                supplier.getDeletedAt(),
                0, // totalPurchases
                BigDecimal.ZERO, // totalCost
                null, // lastPurchaseDate
                BigDecimal.ZERO, // averagePurchaseValue
                Collections.emptyList() // topMaterials
        );
    }

    /**
     * Helper method to map Object[] to MaterialStatsSummaryDTO list
     */
    private List<MaterialStatsSummaryDTO> mapToMaterialStatsSummaryDTOs(List<Object[]> data) {
        return data.stream()
                .map(row -> new MaterialStatsSummaryDTO(
                        ((Number) row[0]).longValue(), // materialId
                        (String) row[1], // materialName
                        (String) row[2], // description
                        (BigDecimal) row[3], // totalQuantity
                        (BigDecimal) row[4], // totalCost
                        (LocalDate) row[5] // lastPurchaseDate
                ))
                .collect(Collectors.toList());
    }

    /**
     * Creates JPA Specification from filter criteria
     */
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