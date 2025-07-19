package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.dto.stock.*;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.model.Sale;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StockManagementService implements IStockManagementService{

    private static final Logger LOGGER = LoggerFactory.getLogger(StockManagementService.class);

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public StockManagementService(ProductRepository productRepository, UserRepository userRepository, Mapper mapper) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // MANUAL STOCK OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StockUpdateResultDTO updateProductStock(StockUpdateDTO updateDTO)
            throws EntityNotFoundException, EntityInvalidArgumentException {

        Product product = getProductEntityById(updateDTO.productId());
        User updater = getUserEntityById(updateDTO.updaterUserId());

        //Calculate stock changes
        StockCalculationResult result = calculateStockChange(product, updateDTO);

        try {
            //Apply changes
            updateProductStockValue(product, result.newStock(), updater);

            //Log stock movement
            logStockMovement(product, result, updateDTO.updateType().toString(), "MANUAL");

            return new StockUpdateResultDTO(
                    product.getId(),
                    product.getCode(),
                    result.previousStock(),
                    result.newStock(),
                    result.changeAmount(),
                    true,
                    null,
                    updateDTO.updateType().toString(),
                    "MANUAL",
                    LocalDateTime.now()
            );

        } catch (Exception e) {
            LOGGER.error("Failed to update stock for product {}: {}", product.getCode(), e.getMessage());
            return new StockUpdateResultDTO(
                    product.getId(),
                    product.getCode(),
                    result.previousStock(),
                    result.previousStock(),
                    0,
                    false,
                    e.getMessage(),
                    updateDTO.updateType().toString(),
                    "MANUAL",
                    LocalDateTime.now()
            );
        }
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<StockUpdateResultDTO> updateMultipleProductsStock(BulkStockUpdateDTO bulkUpdate) {

        List<StockUpdateResultDTO> results = new ArrayList<>();

        for (StockUpdateDTO update : bulkUpdate.updates()) {
            try {
                StockUpdateResultDTO result = updateProductStock(update);
                results.add(result);
            } catch (Exception e) {
                results.add(new StockUpdateResultDTO(
                        update.productId(),
                        "Unknown",
                        0,
                        0,
                        0,
                        false,
                        e.getMessage(),
                        update.updateType().toString(),
                        "MANUAL",
                        LocalDateTime.now()
                ));
            }
        }

        int successCount = (int) results.stream().mapToInt(r -> r.success() ? 1 : 0).sum();
        LOGGER.info("Bulk stock update completed: {} updates, {} successful", results.size(), successCount);

        return results;
    }


    @Override
    @Transactional(readOnly = true)
    public Paginated<StockManagementDTO> getProductsForStockManagement(ProductFilters filters) {

        // Ensure we only get active products
        filters.setIsActive(true);

        Page<Product> products = productRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );

        Page<StockManagementDTO> stockData = products.map(mapper::mapToStockManagementDTO);
        return new Paginated<>(stockData);
    }

    // =============================================================================
    // AUTOMATIC STOCK OPERATIONS (Called by Other Services)
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reduceStockAfterSale(Map<Product, BigDecimal> productQuantities, Long saleId)
            throws EntityNotFoundException {

        for (Map.Entry<Product, BigDecimal> entry : productQuantities.entrySet()) {

            Product product = entry.getKey();
            BigDecimal quantity = entry.getValue();

            if (product.getStock() == null) {
                LOGGER.debug("Product {} has no stock tracking enabled. Skipping stock reduction.",
                        product.getCode());
                continue;
            }

            Integer currentStock = product.getStock();
            Integer newStock = currentStock - quantity.intValue();

            if (newStock < 0) {
                LOGGER.warn("Product {} stock will go negative after sale! Current: {}, Selling: {}",
                        product.getCode(), currentStock, quantity);
            }

            updateProductStockValue(product, newStock, null); // No user for automatic operations

            // Log stock movement for audit
            logStockMovement(product,
                    new StockCalculationResult(currentStock, newStock, -quantity.intValue()),
                    "REMOVE", "SALE");

            LOGGER.debug("Reduced stock for product {} from {} to {} (sale: {})",
                    product.getCode(), currentStock, newStock, saleId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreStockAfterSaleDeleted(Map<Product, BigDecimal> productQuantities, Long saleId)
            throws EntityNotFoundException {

        for (Map.Entry<Product, BigDecimal> entry : productQuantities.entrySet()) {
            Product product = entry.getKey();
            BigDecimal quantity = entry.getValue();


            if (product.getStock() == null) {
                LOGGER.debug("Product {} has no stock tracking enabled. Skipping stock restoration.",
                        product.getCode());
                continue;
            }

            Integer currentStock = product.getStock();
            Integer newStock = currentStock + quantity.intValue();

            updateProductStockValue(product, newStock, null);

            // Log stock movement for audit
            logStockMovement(product,
                    new StockCalculationResult(currentStock, newStock, quantity.intValue()),
                    "ADD", "SALE");

            LOGGER.debug("Restored stock for product {} from {} to {} (sale deleted: {})",
                    product.getCode(), currentStock, newStock, saleId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adjustStockAfterSaleUpdated(Map<Product, BigDecimal> oldQuantities,
                                            Map<Product, BigDecimal> newQuantities, Long saleId)
            throws EntityNotFoundException {

        // Calculate differences and adjust stock accordingly
        for (Product product : oldQuantities.keySet()) {
            BigDecimal oldQuantity = oldQuantities.get(product);
            BigDecimal newQuantity = newQuantities.getOrDefault(product, BigDecimal.ZERO);
            BigDecimal difference = oldQuantity.subtract(newQuantity);

            if (difference.compareTo(BigDecimal.ZERO) != 0 && product.getStock()!= null) {

                Integer currentStock = product.getStock();
                Integer adjustedStock = currentStock + difference.intValue();

                updateProductStockValue(product, adjustedStock, null);

                logStockMovement(product,
                        new StockCalculationResult(currentStock, adjustedStock, difference.intValue()),
                        "ADJUST", "SALE");
            }
        }
    }

    // =============================================================================
    // STOCK MONITORING AND ALERTS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<StockAlertDTO> getLowStockProducts(int limit) {

        ProductFilters filters = ProductFilters.builder()
                .lowStock(true)
                .isActive(true)
                .build();

        Specification<Product> spec = getSpecsFromFilters(filters);

        return productRepository.findAll(spec)
                .stream()
                .map(mapper::mapToStockAlertDto)
                .collect(Collectors.toList());

    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<StockAlertDTO> getAllLowStockProductsPaginated(ProductFilters filters) {
        // Ensure we're filtering for low stock and active products
        filters.setLowStock(true);
        filters.setIsActive(true);

        Specification<Product> spec = getSpecsFromFilters(filters);
        Page<Product> products = productRepository.findAll(spec, filters.getPageable());

        Page<StockAlertDTO> stockAlerts = products.map(mapper::mapToStockAlertDto);
        return new Paginated<>(stockAlerts);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockAlertDTO> getNegativeStockProducts(int limit) {

        ProductFilters filters = ProductFilters.builder()
                .negativeStock(true)
                .isActive(true)
                .build();

        Specification<Product> spec = getSpecsFromFilters(filters);

        return productRepository.findAll(spec)
                .stream()
                .map(mapper::mapToStockAlertDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StockOverviewDTO getStockOverview() {
        LOGGER.debug("Calculating stock overview");

        ProductFilters lowStockFilters = ProductFilters.builder()
                .lowStock(true)
                .isActive(true)
                .build();

        ProductFilters negativeStockFilters = ProductFilters.builder()
                .negativeStock(true)
                .isActive(true)
                .build();


        // Multiple simple repository calls - your preferred pattern
        Integer totalProducts = productRepository.countByIsActiveTrue();
        Integer lowStockCount = countProductsByFilters(lowStockFilters);
        Integer negativeStockCount = countProductsByFilters(negativeStockFilters);
        BigDecimal totalInventoryValue = productRepository.calculateTotalInventoryValue();

        Double healthPercentage = calculateStockHealthPercentage(totalProducts, lowStockCount, negativeStockCount);

        return new StockOverviewDTO(
                totalProducts,
                lowStockCount,
                negativeStockCount,
                totalInventoryValue,
                healthPercentage
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Product getProductEntityById(Long id) throws EntityNotFoundException {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product",
                        "Product with id=" + id + " was not found"));
    }

    private User getUserEntityById(Long id) throws EntityNotFoundException {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User",
                        "User with id=" + id + " was not found"));
    }


    // =============================================================================
    // PRIVATE HELPER METHODS - Stock Calculations
    // =============================================================================

    private StockCalculationResult calculateStockChange(Product product, StockUpdateDTO updateDTO) {
        Integer previousStock = product.getStock() != null ? product.getStock() : 0;
        Integer newStock;
        Integer changeAmount;

        switch (updateDTO.updateType()) {
            case ADD:
                newStock = previousStock + updateDTO.quantity();
                changeAmount = updateDTO.quantity();
                break;
            case REMOVE:
                newStock = previousStock - updateDTO.quantity();
                changeAmount = -updateDTO.quantity();
                break;
            default:
                newStock = updateDTO.quantity();
                changeAmount = newStock - previousStock;

        }

        return new StockCalculationResult(previousStock, newStock, changeAmount);
    }

    private void updateProductStockValue(Product product, Integer newStock, User updater) {
        product.setStock(newStock);
        if (updater != null) {
            product.setLastUpdatedBy(updater);
        }
        productRepository.save(product);
    }

    private void logStockMovement(Product product, StockCalculationResult result,
                                  String operationType, String movementReason) {
        LOGGER.info("STOCK_MOVEMENT: Product={}, Operation={}, Reason={}, Previous={}, New={}, Change={}",
                product.getCode(), operationType, movementReason, result.previousStock(),
                result.newStock(), result.changeAmount());
    }

    private Double calculateStockHealthPercentage(Integer total, Integer low, Integer negative) {
        if (total == 0) return 100.0;
        Integer problematicStock = low + negative;
        return ((total - problematicStock) * 100.0) / total;
    }


    private Specification<Product> getSpecsFromFilters(ProductFilters filters) {
        return Specification
                .where(ProductSpecification.productNameOrCodeLike(filters.getNameOrCode()))
                .and(ProductSpecification.productCategoryId(filters.getCategoryId()))
                .and(ProductSpecification.productStockBetween(filters.getMinStock(), filters.getMaxStock()))
                .and(ProductSpecification.productIsActive(filters.getIsActive()))
                .and(ProductSpecification.productLowStock(filters.getLowStock()))
                .and(ProductSpecification.productNegativeStock(filters.getNegativeStock()));
    }

    private Integer countProductsByFilters(ProductFilters filters) {
        Specification<Product> spec = getSpecsFromFilters(filters);
        return (int) productRepository.count(spec);
    }


}