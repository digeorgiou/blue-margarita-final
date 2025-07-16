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
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

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

        LOGGER.info("Creating new expense: {} - {}", dto.description(), dto.amount());

        // Validate creator user exists
        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + dto.creatorUserId() + " was not found"));

        // Validate purchase if provided
        Purchase purchase = null;
        if (dto.purchaseId() != null) {
            purchase = purchaseRepository.findById(dto.purchaseId())
                    .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + dto.purchaseId() + " was not found"));

            // Check if purchase already has an expense linked
            if (expenseRepository.existsByPurchaseId(dto.purchaseId())) {
                throw new EntityAlreadyExistsException("Purchase", "Purchase already has an expense linked to it");
            }
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

        LOGGER.info("Updating expense with id: {}", dto.expenseId());

        Expense existingExpense = expenseRepository.findById(dto.expenseId())
                .orElseThrow(() -> new EntityNotFoundException("Expense", "Expense with id=" + dto.expenseId() + " was not found"));

        // Validate updater user exists
        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + dto.updaterUserId() + " was not found"));

        // Handle purchase linking/unlinking
        if (dto.purchaseId() != null) {
            // Check if this is a different purchase
            if (existingExpense.getPurchase() == null || !existingExpense.getPurchase().getId().equals(dto.purchaseId())) {
                Purchase newPurchase = purchaseRepository.findById(dto.purchaseId())
                        .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + dto.purchaseId() + " was not found"));

                // Check if new purchase already has an expense
                if (expenseRepository.existsByPurchaseId(dto.purchaseId())) {
                    throw new EntityAlreadyExistsException("Purchase","Purchase already has an expense linked to it");
                }

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

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense", "Expense with id=" + expenseId + " was not found"));

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

        List<Object[]> results = expenseRepository.findExpenseSummaryByType(dateFrom, dateTo);

        // Calculate total for percentage calculation
        BigDecimal grandTotal = results.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return results.stream()
                .map(row -> {
                    ExpenseType type = (ExpenseType) row[0];
                    BigDecimal amount = (BigDecimal) row[1];
                    Long count = (Long) row[2];
                    BigDecimal percentage = grandTotal.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(grandTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                            : BigDecimal.ZERO;

                    return new ExpenseTypeBreakdownDTO(type, amount, count, percentage);
                })
                .collect(Collectors.toList());
    }


    // =============================================================================
    // PURCHASE INTEGRATION METHODS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExpenseReadOnlyDTO createPurchaseExpense(Long purchaseId, String description,
                                                        BigDecimal amount, LocalDate expenseDate,
                                                        Long creatorUserId) throws EntityNotFoundException, EntityAlreadyExistsException {

        LOGGER.info("Creating expense for purchase: {}", purchaseId);

        // Validate purchase exists
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new EntityNotFoundException("Purchase", "Purchase with id=" + purchaseId + " was not found"));

        // Check if purchase already has an expense
        if (expenseRepository.existsByPurchaseId(purchaseId)) {
            throw new EntityAlreadyExistsException("Purcahse", "Purchase already has an expense linked to it");
        }

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

        LOGGER.info("Updating expense for purchase: {}", purchaseId);

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

    private String createPurchaseDescription(Purchase purchase) {
        if (purchase.getSupplier() != null) {
            return purchase.getSupplier().getName() + " - " + purchase.getPurchaseDate();
        }
        return "Purchase " + purchase.getId() + " - " + purchase.getPurchaseDate();
    }

    private ExpenseSummaryDTO calculateExpenseSummary(ExpenseFilters filters) {

        Integer totalCount = (int) countExpensesByFilters(filters);

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

    private long countExpensesByFilters(ExpenseFilters filters) {
        Specification<Expense> spec = getSpecsFromFilters(filters);
        return expenseRepository.count(spec);
    }

    public BigDecimal sumTotalCostByFilters(ExpenseFilters filters) {
        Specification<Expense> spec = getSpecsFromFilters(filters);
        List<Expense> expenses = expenseRepository.findAll(spec);

        return expenses.stream()
                .map(Expense::getAmount)
                .filter(cost -> cost != null)
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
