package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProcedureSpecification;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.*;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Category;
import gr.aueb.cf.bluemargarita.model.Procedure;
import gr.aueb.cf.bluemargarita.model.ProcedureProduct;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.ProcedureRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import gr.aueb.cf.bluemargarita.service.IProcedureService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProcedureService implements IProcedureService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProcedureService.class);
    private final ProcedureRepository procedureRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public ProcedureService(ProcedureRepository procedureRepository, UserRepository userRepository, Mapper mapper) {
        this.procedureRepository = procedureRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProcedureReadOnlyDTO createProcedure(ProcedureInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (procedureRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Procedure", "Procedure with name " + dto.name() + " already exists");
        }

        Procedure procedure = mapper.mapProcedureInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        procedure.setCreatedBy(creator);
        procedure.setLastUpdatedBy(creator);

        Procedure insertedProcedure = procedureRepository.save(procedure);

        LOGGER.info("Procedure created with id: {}", insertedProcedure.getId());

        return mapper.mapToProcedureReadOnlyDTO(insertedProcedure);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProcedureReadOnlyDTO updateProcedure(ProcedureUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Procedure existingProcedure = procedureRepository.findById(dto.procedureId())
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + dto.procedureId() + " was not found"));

        if (!existingProcedure.getName().equals(dto.name()) && procedureRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Procedure", "Procedure with name " + dto.name() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Procedure updatedProcedure = mapper.mapProcedureUpdateToModel(dto, existingProcedure);
        updatedProcedure.setLastUpdatedBy(updater);

        Procedure savedProcedure = procedureRepository.save(updatedProcedure);

        LOGGER.info("Procedure {} updated by user {}", savedProcedure.getName(), updater.getUsername());

        return mapper.mapToProcedureReadOnlyDTO(savedProcedure);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProcedure(Long id) throws EntityNotFoundException {

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + id + " was not found"));

        if (!procedure.getAllProcedureProducts().isEmpty()) {
            // Soft Delete if procedure is used in any products
            procedure.setIsActive(false);
            procedure.setDeletedAt(LocalDateTime.now());
            procedureRepository.save(procedure);

            LOGGER.info("Procedure {} soft deleted. Used in {} products", procedure.getName(), procedure.getAllProcedureProducts().size());
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
    // QUERY OPERATIONS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProcedureReadOnlyDTO> getAllActiveProcedures() {
        List<Procedure> procedures = procedureRepository.findByIsActiveTrue();

        return procedures.stream().map(mapper::mapToProcedureReadOnlyDTO)
                .collect(Collectors.toList());
    }

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
    public List<ProcedureReadOnlyDTO> getFilteredProcedures(ProcedureFilters filters) {
        return procedureRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToProcedureReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProcedureReadOnlyDTO> getProceduresFilteredPaginated(ProcedureFilters filters) {
        var filtered = procedureRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToProcedureReadOnlyDTO));
    }

    // =============================================================================
    // ANALYTICS AND DETAILED VIEWS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public ProcedureDetailedDTO getProcedureDetailedById(Long id) throws EntityNotFoundException {

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + id + " was not found"));

        // Calculate basic statistics using existing relationships
        Set<ProcedureProduct> procedureProducts = procedure.getAllProcedureProducts();
        Integer totalProductsUsing = procedureProducts.size();

        // Calculate cost statistics
        List<BigDecimal> costs = procedureProducts.stream()
                .map(ProcedureProduct::getCost)
                .filter(Objects::nonNull)
                .toList();

        BigDecimal averageProcedureCost = costs.isEmpty() ? BigDecimal.ZERO :
                costs.stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(costs.size()), 2, RoundingMode.HALF_UP);

        BigDecimal minProcedureCost = costs.stream()
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxProcedureCost = costs.stream()
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Calculate product selling price statistics
        List<BigDecimal> sellingPricesRetail = procedureProducts.stream()
                .map(pp -> pp.getProduct().getFinalSellingPriceRetail())
                .filter(Objects::nonNull)
                .toList();

        BigDecimal averageProductSellingPriceRetail = sellingPricesRetail.isEmpty() ? BigDecimal.ZERO :
                sellingPricesRetail.stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(sellingPricesRetail.size()), 2, RoundingMode.HALF_UP);


        // Calculate category distribution
        List<CategoryUsageDTO> categoryDistribution = calculateCategoryDistribution(procedureProducts);

        return new ProcedureDetailedDTO(
                procedure.getId(),
                procedure.getName(),
                procedure.getCreatedAt(),
                procedure.getUpdatedAt(),
                procedure.getCreatedBy().getUsername(),
                procedure.getLastUpdatedBy().getUsername(),
                procedure.getIsActive(),
                procedure.getDeletedAt(),
                totalProductsUsing,
                averageProcedureCost,
                minProcedureCost,
                maxProcedureCost,
                averageProductSellingPriceRetail,
                categoryDistribution
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Calculates category distribution for products using this procedure
     * Groups products by category and calculates percentages
     *
     * @param procedureProducts Set of procedure-product relationships
     * @return List of category usage statistics sorted by product count (descending)
     */

    private List<CategoryUsageDTO> calculateCategoryDistribution(Set<ProcedureProduct> procedureProducts) {
        if (procedureProducts.isEmpty()) {
            return new ArrayList<>();
        }

        // Group by category and count products
        Map<Category, Long> categoryCount = procedureProducts.stream()
                .collect(Collectors.groupingBy(
                        pp -> pp.getProduct().getCategory(),
                        Collectors.counting()
                ));

        int totalProducts = procedureProducts.size();

        return categoryCount.entrySet().stream()
                .map(entry -> new CategoryUsageDTO(
                        entry.getKey().getId(),
                        entry.getKey().getName(),
                        entry.getValue().intValue(),
                        (entry.getValue() * 100.0) / totalProducts
                ))
                .sorted((c1, c2) -> c2.productCount().compareTo(c1.productCount()))
                .collect(Collectors.toList());
    }

    /**
     * Creates JPA Specification from filter criteria
     * Combines name filtering and active status filtering using AND logic
     */

    private Specification<Procedure> getSpecsFromFilters(ProcedureFilters filters) {
        return Specification
                .where(ProcedureSpecification.procedureNameLike(filters.getName()))
                .and(ProcedureSpecification.procedureIsActive(filters.getIsActive()));
    }
}