package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.ExpenseFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ExpenseSpecification;
import gr.aueb.cf.bluemargarita.dto.expense.*;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class ExpenseService implements IExpenseService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final Mapper mapper;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository,
                          UserRepository userRepository,
                          PurchaseRepository purchaseRepository,
                          Mapper mapper) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.purchaseRepository = purchaseRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExpenseReadOnlyDTO createExpense(ExpenseInsertDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException {


        User creator = getUserEntityById(dto.creatorUserId());

        // Validate purchase if provided
        Purchase purchase = null;
        if (dto.purchaseId() != null) {
            purchase = getPurchaseEntityById(dto.purchaseId());
            validateUniquePurchase(dto.purchaseId());

        }

        // Create expense entity
        Expense expense = Expense.builder()
                .description(dto.description())
                .amount(dto.amount())
                .expenseDate(dto.expenseDate())
                .expenseType(dto.expenseType())
                .purchase(purchase)
                .build();

        // Set audit fields
        expense.setCreatedBy(creator);
        expense.setLastUpdatedBy(creator);

        // Link to purchase if provided
        if (purchase != null) {
            expense.linkToPurchase(purchase);
        }

        Expense savedExpense = expenseRepository.save(expense);

        LOGGER.info("Expense created with id: {}", savedExpense.getId());

        return mapper.mapToExpenseReadOnlyDTO(savedExpense);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExpenseReadOnlyDTO updateExpense(ExpenseUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException {

        Expense existingExpense = getExpenseEntityById(dto.expenseId());

        // Validate updater user exists
        User updater = getUserEntityById(dto.updaterUserId());

        // Handle purchase linking/unlinking
        if (dto.purchaseId() != null) {
            // Check if this is a different purchase
            if (existingExpense.getPurchase() == null || !existingExpense.getPurchase().getId().equals(dto.purchaseId())) {
                Purchase newPurchase = getPurchaseEntityById(dto.purchaseId());
                // Check if new purchase already has an expense
                validateUniquePurchase(dto.purchaseId());

                // Unlink from old purchase if exists
                if (existingExpense.getPurchase() != null) {
                    existingExpense.unlinkFromPurchase();
                }

                // Link to new purchase
                existingExpense.linkToPurchase(newPurchase);
            }
        } else {
            // Unlink from purchase if purchaseId is null
            if (existingExpense.getPurchase() != null) {
                existingExpense.unlinkFromPurchase();
            }
        }

        // Update fields
        existingExpense.setDescription(dto.description());
        existingExpense.setAmount(dto.amount());
        existingExpense.setExpenseDate(dto.expenseDate());
        existingExpense.setExpenseType(dto.expenseType());
        existingExpense.setLastUpdatedBy(updater);

        Expense savedExpense = expenseRepository.save(existingExpense);

        LOGGER.info("Expense {} updated", savedExpense.getId());

        return mapper.mapToExpenseReadOnlyDTO(savedExpense);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteExpense(Long expenseId) throws EntityNotFoundException {

        Expense expense = getExpenseEntityById(expenseId);

        // Unlink from purchase if linked
        if (expense.getPurchase() != null) {
            expense.unlinkFromPurchase();
        }

        // Hard delete
        expenseRepository.delete(expense);

        LOGGER.info("Expense {} deleted", expenseId);
    }

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseReadOnlyDTO> getRecentExpenses(int limit) {
        return expenseRepository.findAllByOrderByExpenseDateDescCreatedAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(mapper::mapToExpenseReadOnlyDTO)
                .collect(Collectors.toList());
    }

    // =============================================================================
    // VIEW EXPENSES PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public PaginatedFilteredExpensesWithSummary searchExpensesWithSummary(ExpenseFilters filters) {

        Page<ExpenseReadOnlyDTO> filtered = expenseRepository.findAll(getSpecsFromFilters(filters), filters.getPageable())
                .map(mapper::mapToExpenseReadOnlyDTO);

        long totalFilteredResults = filtered.getTotalElements();
        ExpenseSummaryDTO summary = null;

        if (totalFilteredResults <= 100) {
            summary = calculateExpenseSummary(filters);
        }

        return new PaginatedFilteredExpensesWithSummary(filtered, summary);
    }


    // =============================================================================
    // EXPENSE ANALYTICS METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseTypeBreakdownDTO> getExpenseBreakdownByType(LocalDate dateFrom, LocalDate dateTo) {

        List<ExpenseType> expenseTypes = expenseRepository.findDistinctExpenseTypesByDateRange(dateFrom, dateTo);

        BigDecimal grandTotal = expenseRepository.sumExpensesBetweenDates(
                dateFrom != null ? dateFrom : LocalDate.of(2000, 1, 1),
                dateTo != null ? dateTo : LocalDate.now()
        );

        return expenseTypes.stream()
                .map(expenseType -> {
                    BigDecimal amount = expenseRepository.sumAmountByTypeAndDateRange(expenseType, dateFrom, dateTo);
                    Long count = expenseRepository.countByTypeAndDateRange(expenseType, dateFrom, dateTo);

                    BigDecimal percentage = grandTotal.compareTo(BigDecimal.ZERO) > 0 ?
                            amount.divide(grandTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) :
                            BigDecimal.ZERO;
                    return new ExpenseTypeBreakdownDTO(
                            expenseType,
                            expenseType.getDisplayName(),
                            amount,
                            count.intValue(),
                            percentage

                    );
                })
                .sorted((e1, e2) -> e2.totalAmount().compareTo(e1.totalAmount())) // Sort by amount descending
                .collect(Collectors.toList());
    }

    // =============================================================================
    // AUTOMATIC METHODS FOR PURCHASE CREATE/UPDATE
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExpenseReadOnlyDTO createPurchaseExpense(Long purchaseId, String description,
                                                        BigDecimal amount, LocalDate expenseDate,
                                                        Long creatorUserId) throws EntityNotFoundException, EntityAlreadyExistsException {

        // Validate purchase exists
        getPurchaseEntityById(purchaseId);

        // Check if purchase already has an expense
        validateUniquePurchase(purchaseId);

        // Create expense insert DTO
        ExpenseInsertDTO dto = new ExpenseInsertDTO(
                description,
                amount,
                expenseDate,
                ExpenseType.PURCHASE_MATERIALS,
                purchaseId,
                creatorUserId
        );

        return createExpense(dto);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePurchaseExpense(Long purchaseId, BigDecimal newAmount,
                                      LocalDate newDate, Long updaterUserId) throws EntityNotFoundException, EntityAlreadyExistsException {

        Expense expense = expenseRepository.findByPurchaseId(purchaseId);
        if (expense == null) {
            LOGGER.warn("No expense found for purchase: {}", purchaseId);
            return;
        }

        // Create expense update DTO
        ExpenseUpdateDTO dto = new ExpenseUpdateDTO(
                expense.getId(),
                expense.getDescription(),
                newAmount,
                newDate,
                expense.getExpenseType(),
                purchaseId,
                updaterUserId
        );

        updateExpense(dto);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    Expense getExpenseEntityById(Long expenseId) throws EntityNotFoundException {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense", "Expense with id=" + expenseId + " was not found"));
    }

    User getUserEntityById(Long userId) throws EntityNotFoundException{
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + userId + " was not found"));
    }

    Purchase getPurchaseEntityById(Long purchaseId) throws EntityNotFoundException{
        return purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + purchaseId + " was not found"));
    }

    void validateUniquePurchase(Long purchaseId) throws EntityAlreadyExistsException{
        if (expenseRepository.existsByPurchaseId(purchaseId)) {
            throw new EntityAlreadyExistsException("Purchase", "Purchase already has an expense linked to it");
        }
    }

    private ExpenseSummaryDTO calculateExpenseSummary(ExpenseFilters filters) {

        Integer totalCount = countExpensesByFilters(filters);

        if(totalCount == 0) {
            return new ExpenseSummaryDTO(0,BigDecimal.ZERO,BigDecimal.ZERO);
        }

        BigDecimal totalAmount = sumTotalCostByFilters(filters);

        BigDecimal averageAmount = totalAmount.divide(
                BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP
        );

        return new ExpenseSummaryDTO(
                totalCount,
                totalAmount,
                averageAmount
        );
    }

    private Integer countExpensesByFilters(ExpenseFilters filters) {
        Specification<Expense> spec = getSpecsFromFilters(filters);
        return (int) expenseRepository.count(spec);
    }

    public BigDecimal sumTotalCostByFilters(ExpenseFilters filters) {
        Specification<Expense> spec = getSpecsFromFilters(filters);
        List<Expense> expenses = expenseRepository.findAll(spec);

        return expenses.stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Specification<Expense> getSpecsFromFilters(ExpenseFilters filters) {
        return Specification
                .where(ExpenseSpecification.hasDescription(filters.getDescription()))
                .and(ExpenseSpecification.hasExpenseDateBetween(filters.getExpenseDateFrom(), filters.getExpenseDateTo()))
                .and(ExpenseSpecification.hasExpenseType(filters.getExpenseType()))
                .and(ExpenseSpecification.isPurchaseExpense(filters.getIsPurchase()));
    }
}
