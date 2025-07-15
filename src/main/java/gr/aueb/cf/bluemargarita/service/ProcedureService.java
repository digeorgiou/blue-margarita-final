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

        Integer productCount = procedureRepository.countProductsByProcedureId(id);

        if (productCount > 0) {
            // Soft Delete if procedure is used in any products
            procedure.setIsActive(false);
            procedure.setDeletedAt(LocalDateTime.now());
            procedureRepository.save(procedure);

            LOGGER.info("Procedure {} soft deleted. Used in {} products",
                    procedure.getName(), productCount);
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

        LOGGER.debug("Retrieving optimized detailed analytics for procedure id: {}", id);

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure", "Procedure with id=" + id + " was not found"));

        // ✅ OPTIMIZED: Use repository aggregation instead of loading all procedure products
        Integer totalProductsUsing = procedureRepository.countProductsByProcedureId(id);

        if (totalProductsUsing == 0) {
            // No products using this procedure - return empty metrics
            return new ProcedureDetailedDTO(
                    procedure.getId(),
                    procedure.getName(),
                    procedure.getCreatedAt(),
                    procedure.getUpdatedAt(),
                    procedure.getCreatedBy().getUsername(),
                    procedure.getLastUpdatedBy().getUsername(),
                    procedure.getIsActive(),
                    procedure.getDeletedAt(),
                    0,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    Collections.emptyList()
            );
        }

        // Get cost statistics using repository aggregation
        Object[] costStats = procedureRepository.calculateCostStatsByProcedureId(id);
        BigDecimal averageProcedureCost = costStats != null && costStats[0] != null ? (BigDecimal) costStats[0] : BigDecimal.ZERO;
        BigDecimal minProcedureCost = costStats != null && costStats[1] != null ? (BigDecimal) costStats[1] : BigDecimal.ZERO;
        BigDecimal maxProcedureCost = costStats != null && costStats[2] != null ? (BigDecimal) costStats[2] : BigDecimal.ZERO;

        // Get average product selling price using repository aggregation
        BigDecimal averageProductSellingPrice = procedureRepository.calculateAverageProductPriceByProcedureId(id);
        if (averageProductSellingPrice == null) {
            averageProductSellingPrice = BigDecimal.ZERO;
        }

        // Get category distribution using repository aggregation
        List<Object[]> categoryData = procedureRepository.calculateCategoryDistributionByProcedureId(id, totalProductsUsing);
        List<CategoryUsageDTO> categoryDistribution = categoryData.stream()
                .map(data -> new CategoryUsageDTO(
                        (Long) data[0],           // categoryId
                        (String) data[1],         // categoryName
                        ((Number) data[2]).intValue(), // productCount
                        ((Number) data[3]).doubleValue() // percentage
                ))
                .collect(Collectors.toList());

        LOGGER.debug("Optimized analytics completed for procedure '{}': totalProducts={}, avgCost={}, categories={}",
                procedure.getName(), totalProductsUsing, averageProcedureCost, categoryDistribution.size());

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
                averageProductSellingPrice,
                categoryDistribution
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================


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