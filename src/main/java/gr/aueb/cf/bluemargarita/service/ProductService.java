package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.WeeklySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.stock.BulkStockUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockManagementDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockUpdateResultDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService implements IProductService{


    private static final Logger LOGGER = LoggerFactory.getLogger(ProductService.class);
    private static final BigDecimal HOURLY_LABOR_RATE = BigDecimal.valueOf(7.0);
    private static final BigDecimal RETAIL_MARKUP_FACTOR = BigDecimal.valueOf(3.0);
    private static final BigDecimal WHOLESALE_MARKUP_FACTOR = BigDecimal.valueOf(1.86);
    private static final BigDecimal MINUTES_PER_HOUR = BigDecimal.valueOf(60.0);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialRepository materialRepository;
    private final ProcedureRepository procedureRepository;
    private final UserRepository userRepository;
    private final ProductSalesAnalyticsService analyticsService;
    private final Mapper mapper;

    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, MaterialRepository materialRepository, ProcedureRepository procedureRepository,
                          UserRepository userRepository, ProductSalesAnalyticsService analyticsService, Mapper mapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.materialRepository = materialRepository;
        this.procedureRepository = procedureRepository;
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductListItemDTO createProduct(ProductInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException {

        // Validate unique constraints
        validateUniqueName(dto.name());
        validateUniqueCode(dto.code());

        // Validate category exists and is active
        Category category = getCategoryById(dto.categoryId());

        // Create product
        Product product = mapper.mapProductInsertToModel(dto);
        product.setCategory(category);

        User creator = getUserEntityById(dto.creatorUserId());

        product.setCreatedBy(creator);
        product.setLastUpdatedBy(creator);

        // Save product first to get ID
        Product savedProduct = productRepository.save(product);

        // Handle materials if provided
        if (dto.materials() != null && !dto.materials().isEmpty()) {
            addMaterialsToProduct(savedProduct, dto.materials());
        }

        // Handle procedures if provided
        if (dto.procedures() != null && !dto.procedures().isEmpty()) {
            addProceduresToProduct(savedProduct, dto.procedures());
        }

        product.setSuggestedRetailSellingPrice(calculateSuggestedRetailPrice(product));
        product.setSuggestedWholeSaleSellingPrice(calculateSuggestedWholesalePrice(product));

        // Save again with relationships and pricing
        savedProduct = productRepository.save(savedProduct);

        LOGGER.info("Product created with id: {} and code: {}",
                savedProduct.getId(), savedProduct.getCode());

        ProductCostDataDTO data = getDataDTOForProduct(savedProduct);

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductListItemDTO updateProduct(ProductUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException {

        // Get existing product
        Product existingProduct = getProductEntityById(dto.productId());

        //Validate unique name if changed
        if(!existingProduct.getName().equals(dto.name())){
            validateUniqueName(dto.name());
        }

        // Validate unique code if changed
        if (!existingProduct.getCode().equals(dto.code())) {
            validateUniqueCode(dto.code());
        }

        // Validate category if changed
        Category category = null;
        if (!existingProduct.getCategory().getId().equals(dto.categoryId())) {
            category = getCategoryById(dto.categoryId());
        }

        // Update product fields
        Product updatedProduct = mapper.mapProductUpdateToModel(dto, existingProduct);
        if (category != null) {
            updatedProduct.setCategory(category);
        }

        User updaterUser = getUserEntityById(dto.updaterUserId());

        updatedProduct.setLastUpdatedBy(updaterUser);

        Product savedProduct = productRepository.save(updatedProduct);

        ProductCostDataDTO data = getDataDTOForProduct(savedProduct);

        LOGGER.info("Product {} updated", savedProduct.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(Long id) throws EntityNotFoundException {

        Product product = getProductEntityById(id);

        // Check if product has sales - if yes, only soft delete
        if (!product.getAllSaleProducts().isEmpty()) {
            // Soft delete - preserve sales history
            product.setIsActive(false);
            product.setDeletedAt(LocalDateTime.now());

            productRepository.save(product);

            LOGGER.info("Product {} soft deleted. Used in {} sales",
                    product.getCode(), product.getAllSaleProducts().size());
        } else {
            // Hard delete - no sales history
            // Clear all relationships first
            clearProductMaterials(product);
            clearProductProcedures(product);

            // Remove from category
            if (product.getCategory() != null) {
                product.getCategory().removeProduct(product);
            }

            productRepository.delete(product);

            LOGGER.info("Product {} hard deleted (not used in any sales)",
                    product.getCode());
        }
    }

    // =============================================================================
    // PRODUCT LISTING AND FILTERING
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductListItemDTO> getProductListItemsPaginated(ProductFilters filters) {
        var filtered = productRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );

        var mappedPage = filtered.map(product -> {
            ProductCostDataDTO data = getDataDTOForProduct(product);
            return mapper.mapToProductListItemDTO(product, data);
        });

        return new Paginated<>(mappedPage);

    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailedViewDTO getProductDetails(Long productId) throws EntityNotFoundException {
        Product product = getProductEntityById(productId);
        return mapToProductDetailsDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public int getActiveProductCount() {
        return (int) productRepository.countByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSearchResultDTO> searchProductsForAutocomplete(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            return Collections.emptyList();
        }

        Specification<Product> spec = Specification
                .where(ProductSpecification.productNameOrCodeLike(searchTerm.trim()))
                .and(ProductSpecification.productIsActive(true));

        return productRepository.findAll(spec)
                .stream()
                .limit(10)
                .map(product -> new ProductSearchResultDTO(
                        product.getId(),
                        product.getName(),
                        product.getCode(),
                        product.getCategory() != null ? product.getCategory().getName() : "No Category"
                ))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // SALES ANALYTICS (Sales Data Buttons)
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public ProductSalesAnalyticsDTO getProductSalesAnalytics(Long productId,
                                                             LocalDate startDate,
                                                             LocalDate endDate)
            throws EntityNotFoundException {
        return analyticsService.getProductSalesAnalytics(productId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WeeklySalesDataDTO> getProductWeeklySales(Long productId,
                                                          LocalDate startDate,
                                                          LocalDate endDate)
            throws EntityNotFoundException {
        return analyticsService.getWeeklySalesData(productId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlySalesDataDTO> getProductMonthlySales(Long productId,
                                                            LocalDate startDate,
                                                            LocalDate endDate)
            throws EntityNotFoundException {
        return analyticsService.getMonthlySalesData(productId, startDate, endDate);
    }

    public List<YearlySalesDataDTO> getProductYearlySales(Long productId,
                                                          LocalDate startDate,
                                                          LocalDate endDate) throws EntityNotFoundException{
        return analyticsService.getYearlySalesData(productId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationSalesDataDTO> getTopLocationsByProductSales(Long productId,
                                                                    LocalDate startDate,
                                                                    LocalDate endDate,
                                                                    int limit)
            throws EntityNotFoundException {
        return analyticsService.getTopLocationsByProductSales(productId, startDate, endDate, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerSalesDataDTO> getTopCustomersByProductPurchases(Long productId,
                                                                        LocalDate startDate,
                                                                        LocalDate endDate,
                                                                        int limit)
            throws EntityNotFoundException {
        return analyticsService.getTopCustomersByProductPurchases(productId, startDate, endDate, limit);
    }

    // =============================================================================
    // DASHBOARD PAGE METHODS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductListItemDTO> getLowStockProducts(int limit) {

        ProductFilters filters = ProductFilters.builder()
                .lowStock(true)
                .isActive(true)
                .build();

        // Set page size to limit
        filters.setPage(0);
        filters.setPageSize(limit);
        filters.setSortBy("stock");
        filters.setSortDirection(Sort.Direction.ASC);

        return getProductListItemsPaginated(filters).getData();
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductListItemDTO> getAllLowStockProducts(Pageable pageable) {

        // Apply default sorting if none specified (lowest stock first - most urgent)
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.ASC, "stock")
            );
        }

        // Build filter for low stock products
        ProductFilters filters = ProductFilters.builder()
                .lowStock(true)
                .isActive(true)
                .build();

        // Convert Pageable to filter format
        filters.setPage(pageable.getPageNumber());
        filters.setPageSize(pageable.getPageSize());
        filters.setSortBy(getSortFieldFromPageable(pageable));
        filters.setSortDirection(getSortDirectionFromPageable(pageable));

        return getProductListItemsPaginated(filters);
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductListItemDTO> getAllNegativeStockProducts(Pageable pageable) {

        // Apply default sorting if none specified (most negative first - most urgent)
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.ASC, "stock")
            );
        }

        Page<Product> negativeStockProducts = productRepository.findProductsWithNegativeStock(pageable);

        Page<ProductListItemDTO> mappedProducts = negativeStockProducts.map(product -> {
            ProductCostDataDTO costData = getDataDTOForProduct(product);
            return mapper.mapToProductListItemDTO(product, costData);
        });

        return new Paginated<>(mappedProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductStatsSummaryDTO> getTopProductsByMonthlyRevenue(LocalDate startDate,
                                                                       LocalDate endDate,
                                                                       int limit){
        return analyticsService.getTopProductsByRevenue(startDate,endDate,limit);
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductStatsSummaryDTO> getAllTopProductsForPeriod(LocalDate startDate,
                                                                        LocalDate endDate,
                                                                        Pageable pageable) {

        return  analyticsService.getAllTopProductsForPeriod(startDate, endDate, pageable);
    }

    // =============================================================================
    // MATERIAL/PROCEDURE RELATIONSHIP MANAGEMENT
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductListItemDTO addMaterialToProduct(Long productId, Long materialId,
                                                   BigDecimal quantity, Long updaterUserId)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material",
                        "Material with id " + materialId + " not found"));

        // Remove existing if present, then add new
        product.removeMaterial(material);
        product.addMaterial(material, quantity);

        User updaterUser = userRepository.findById(updaterUserId).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + updaterUserId + " not found"));
        product.setLastUpdatedBy(updaterUser);
        updatePricing(product);
        Product savedProduct = productRepository.save(product);
        ProductCostDataDTO data = getDataDTOForProduct(product);

        LOGGER.info("Added material {} (quantity: {}) to product {}",
                material.getName(), quantity, product.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductListItemDTO  removeMaterialFromProduct(Long productId, Long materialId, Long updaterUserId)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Material",
                        "Material with id " + materialId + " not found"));

        product.removeMaterial(material);
        User updaterUser = userRepository.findById(updaterUserId).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + updaterUserId + " not found"));
        product.setLastUpdatedBy(updaterUser);
        updatePricing(product);
        Product savedProduct = productRepository.save(product);
        ProductCostDataDTO data = getDataDTOForProduct(product);

        LOGGER.info("Removed material {} from product {}",
                material.getName(), product.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductListItemDTO  addProcedureToProduct(Long productId, Long procedureId,
                                                     BigDecimal cost, Long updaterUserId)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);
        Procedure procedure = procedureRepository.findById(procedureId)
                .orElseThrow(() -> new EntityNotFoundException("Procedure",
                        "Procedure with id " + procedureId + " not found"));

        // Remove existing if present, then add new
        product.removeProcedure(procedure);
        product.addProcedure(procedure, cost);

        User updaterUser = userRepository.findById(updaterUserId).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + updaterUserId + " not found"));
        product.setLastUpdatedBy(updaterUser);
        updatePricing(product);
        Product savedProduct = productRepository.save(product);

        ProductCostDataDTO data = getDataDTOForProduct(product);

        LOGGER.info("Added procedure {} (cost: {}) to product {}",
                procedure.getName(), cost, product.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductListItemDTO  removeProcedureFromProduct(Long productId, Long procedureId, Long updaterUserId)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);
        Procedure procedure = procedureRepository.findById(procedureId)
                .orElseThrow(() -> new EntityNotFoundException("Procedure",
                        "Procedure with id " + procedureId + " not found"));

        product.removeProcedure(procedure);

        User updaterUser = userRepository.findById(updaterUserId).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + updaterUserId + " not found"));
        product.setLastUpdatedBy(updaterUser);
        updatePricing(product);
        Product savedProduct = productRepository.save(product);
        ProductCostDataDTO data = getDataDTOForProduct(product);

        LOGGER.info("Removed procedure {} from product {}",
                procedure.getName(), product.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }


    // =============================================================================
    // STOCK MANAGEMENT
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<StockManagementDTO> getProductsForStockManagement(ProductFilters filters) {

        // Ensure we only get active products for stock management
        filters.setIsActive(true);

        Page<Product> products = productRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );

        Page<StockManagementDTO> stockData = products.map(mapper::mapToStockManagementDTO);

        return new Paginated<>(stockData);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StockUpdateResultDTO updateProductStock(StockUpdateDTO updateDTO) throws EntityNotFoundException {

        Product product = productRepository.findById(updateDTO.productId())
                .orElseThrow(() -> new EntityNotFoundException("Product", "Product with id=" + updateDTO.productId() + " was not found"));

        Integer previousStock = product.getStock() != null ? product.getStock() : 0;
        Integer newStock;
        Integer changeAmount;

        try {
            switch (updateDTO.updateType()) {
                case ADD:
                    newStock = previousStock + updateDTO.quantity();
                    changeAmount = updateDTO.quantity();
                    break;
                case REMOVE:
                    newStock = previousStock - updateDTO.quantity();
                    changeAmount = -updateDTO.quantity();
                    break;
                case SET:
                    newStock = updateDTO.quantity();
                    changeAmount = newStock - previousStock;
                    break;
                default:
                    throw new IllegalArgumentException("Invalid update type: " + updateDTO.updateType());
            }

            // Update the product
            product.setStock(newStock);

            // Set last updated user
            User updater = userRepository.findById(updateDTO.updaterUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + updateDTO.updaterUserId() + " was not found"));
            product.setLastUpdatedBy(updater);

            productRepository.save(product);

            // Log the stock change (you might want to create a StockHistory entity)
            LOGGER.info("Stock updated for product {}: {} -> {} (change: {}, reason: {})",
                    product.getCode(), previousStock, newStock, changeAmount, updateDTO.reason());

            return new StockUpdateResultDTO(
                    product.getId(),
                    product.getCode(),
                    previousStock,
                    newStock,
                    changeAmount,
                    true,
                    null
            );

        } catch (Exception e) {
            LOGGER.error("Failed to update stock for product {}: {}", product.getCode(), e.getMessage());
            return new StockUpdateResultDTO(
                    product.getId(),
                    product.getCode(),
                    previousStock,
                    previousStock, // No change on error
                    0,
                    false,
                    e.getMessage()
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
                // Continue with other updates even if one fails
                results.add(new StockUpdateResultDTO(
                        update.productId(),
                        "Unknown",
                        0,
                        0,
                        0,
                        false,
                        e.getMessage()
                ));
            }
        }

        LOGGER.info("Bulk stock update completed: {} updates, {} successful",
                results.size(), results.stream().mapToInt(r -> r.success() ? 1 : 0).sum());

        return results;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reduceProductStock(Long productId, BigDecimal quantity) throws EntityNotFoundException {

        Product product = getProductEntityById(productId);

        if(product.getStock() == null) {
            LOGGER.debug("Product {} has no stock tracking enabled. Can not reduce stock.", product.getCode());
            return;
        }

        BigDecimal currentStock = BigDecimal.valueOf(product.getStock());
        BigDecimal newStock = currentStock.subtract(quantity);

        if(newStock.compareTo(BigDecimal.ZERO) < 0) {
            LOGGER.warn("Product {} stock will go negative !", product.getCode());
        }

        product.setStock(newStock.intValue());
        productRepository.save(product);

        LOGGER.info("Reduced stock for product {} by {}. New stock : {}",
                product.getCode(), quantity, newStock);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void increaseProductStock(Long productId, BigDecimal quantity) throws EntityNotFoundException {

        Product product = getProductEntityById(productId);

        if(product.getStock() == null) {
            LOGGER.debug("Product {} has no stock tracking enabled. Can not increase stock", product.getCode());
            return;
        }

        BigDecimal currentStock = BigDecimal.valueOf(product.getStock());
        BigDecimal newStock = currentStock.add(quantity);

        product.setStock(newStock.intValue());
        productRepository.save(product);

        LOGGER.info("Increased stock for product {} by {}. New stock : {}",
                product.getCode(), quantity, newStock);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adjustProductStock(Long productId, BigDecimal oldQuantity, BigDecimal newQuantity) throws EntityNotFoundException {

        Product product = getProductEntityById(productId);

        if(product.getStock() == null) {
            LOGGER.debug("Product {} has no stock tracking enabled. Can not adjust stock.", product.getCode());
            return;
        }

        BigDecimal stockAdjustment = oldQuantity.subtract(newQuantity);
        BigDecimal currentStock = BigDecimal.valueOf(product.getStock());
        BigDecimal newStock = currentStock.add(stockAdjustment);

        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            LOGGER.warn("Product {} stock adjustment will result in negative stock! Current: {}, Adjustment: {}, New stock: {}",
                    product.getCode(), currentStock, stockAdjustment, newStock);
        }

        product.setStock(newStock.intValue());
        productRepository.save(product);

        LOGGER.info("Adjusted stock for product {} from {} to {}. Stock change: {}",
                product.getCode(), oldQuantity, newQuantity, stockAdjustment);
    }




    // =============================================================================
    // BULK OPERATIONS AND PRICING
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriceRecalculationResultDTO recalculateAllProductPrices(Long updaterUserId) throws EntityNotFoundException {

        // Validate updater user exists
        User updaterUser = getUserEntityById(updaterUserId);

        // Get all active products
        List<Product> activeProducts = productRepository.findByIsActiveTrue();

        int updatedCount = 0;
        int skippedCount = 0;
        int failedCount = 0;
        List<String> failedProductCodes = new ArrayList<>();

        if (activeProducts.isEmpty()) {
            LOGGER.info("No active products found for price recalculation");
            return new PriceRecalculationResultDTO(
                    0, 0, 0, 0,
                    LocalDateTime.now(),
                    updaterUser.getUsername(),
                    Collections.emptyList()
            );
        }

        LOGGER.info("Starting price recalculation for {} active products", activeProducts.size());

        for (Product product : activeProducts) {
            try {
                // Calculate new suggested prices
                BigDecimal newRetailPrice = calculateSuggestedRetailPrice(product);
                BigDecimal newWholesalePrice = calculateSuggestedWholesalePrice(product);

                // Check if prices actually changed to avoid unnecessary updates
                boolean retailPriceChanged = !newRetailPrice.equals(product.getSuggestedRetailSellingPrice());
                boolean wholesalePriceChanged = !newWholesalePrice.equals(product.getSuggestedWholeSaleSellingPrice());

                if (retailPriceChanged || wholesalePriceChanged) {
                    // Update prices
                    if (retailPriceChanged) {
                        BigDecimal oldRetailPrice = product.getSuggestedRetailSellingPrice();
                        product.setSuggestedRetailSellingPrice(newRetailPrice);
                        LOGGER.debug("Product {}: Retail price updated from {} to {}",
                                product.getCode(), oldRetailPrice, newRetailPrice);
                    }

                    if (wholesalePriceChanged) {
                        BigDecimal oldWholesalePrice = product.getSuggestedWholeSaleSellingPrice();
                        product.setSuggestedWholeSaleSellingPrice(newWholesalePrice);
                        LOGGER.debug("Product {}: Wholesale price updated from {} to {}",
                                product.getCode(), oldWholesalePrice, newWholesalePrice);
                    }

                    // Update audit fields
                    product.setLastUpdatedBy(updaterUser);

                    // Save the product
                    productRepository.save(product);
                    updatedCount++;

                    LOGGER.debug("Updated pricing for product: {}", product.getCode());
                } else {
                    skippedCount++;
                    LOGGER.debug("No price changes needed for product: {}", product.getCode());
                }

            } catch (Exception e) {
                // Log error but continue with other products
                LOGGER.error("Failed to recalculate prices for product {}: {}",
                        product.getCode(), e.getMessage(), e);
                failedCount++;
                failedProductCodes.add(product.getCode());
            }
        }

        LOGGER.info("Price recalculation completed. Updated: {} products, Skipped: {} products, Failed: {} products",
                updatedCount, skippedCount, failedCount);

        return new PriceRecalculationResultDTO(
                activeProducts.size(),
                updatedCount,
                skippedCount,
                failedCount,
                LocalDateTime.now(),
                updaterUser.getUsername(),
                failedProductCodes
        );
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Data Mapping and Calculations
    // =============================================================================

    /**
     * Maps a Product entity to ProductDetailedViewDTO with complete cost and pricing calculations
     */

    private ProductDetailedViewDTO mapToProductDetailsDTO(Product product) {
        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal procedureCost = calculateProcedureCost(product);
        BigDecimal totalCost = materialCost.add(laborCost).add(procedureCost);

        // Calculate profit margins
        BigDecimal profitMarginRetail = calculateProfitMargin(product.getFinalSellingPriceRetail(), totalCost);
        BigDecimal profitMarginWholesale = calculateProfitMargin(product.getFinalSellingPriceWholesale(), totalCost);

        // Map materials
        List<ProductMaterialDetailDTO> materials = product.getAllProductMaterials().stream()
                .map(pm -> new ProductMaterialDetailDTO(
                        pm.getMaterial().getId(),
                        pm.getMaterial().getName(),
                        pm.getQuantity(),
                        pm.getMaterial().getUnitOfMeasure(),
                        pm.getMaterial().getCurrentUnitCost(),
                        pm.getMaterial().getCurrentUnitCost() != null ?
                                pm.getMaterial().getCurrentUnitCost().multiply(pm.getQuantity()) :
                                BigDecimal.ZERO
                ))
                .collect(Collectors.toList());

        // Map procedures
        List<ProductProcedureDetailDTO> procedures = product.getAllProcedureProducts().stream()
                .map(pp -> new ProductProcedureDetailDTO(
                        pp.getProcedure().getId(),
                        pp.getProcedure().getName(),
                        pp.getCost()
                ))
                .collect(Collectors.toList());

        return new ProductDetailedViewDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory() != null ? product.getCategory().getName() : "No Category",
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getSuggestedRetailSellingPrice(),
                product.getSuggestedWholeSaleSellingPrice(),
                product.getFinalSellingPriceRetail(),
                product.getFinalSellingPriceWholesale(),
                calculatePercentageDifference(product.getFinalSellingPriceRetail(), product.getSuggestedRetailSellingPrice()),
                calculatePercentageDifference(product.getFinalSellingPriceWholesale(), product.getSuggestedWholeSaleSellingPrice()),
                product.getMinutesToMake(),
                totalCost,
                materialCost,
                laborCost,
                procedureCost,
                product.getStock(),
                product.getLowStockAlert(),
                product.getStock() != null && product.getLowStockAlert() != null &&
                        product.getStock() <= product.getLowStockAlert(),
                materials,
                procedures,
                profitMarginRetail,
                profitMarginWholesale,
                product.getIsActive(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getCreatedBy() != null ? product.getCreatedBy().getUsername() : "system",
                product.getLastUpdatedBy() != null ? product.getLastUpdatedBy().getUsername() : "system"
        );
    }

    /**
     * Creates a ProductCostDataDTO for efficient mapper usage
     */

    private ProductCostDataDTO getDataDTOForProduct(Product product) {

        BigDecimal totalCost = calculateMaterialCost(product).add(calculateProcedureCost(product));

        BigDecimal percentageDiff = BigDecimal.ZERO;
        if (product.getSuggestedRetailSellingPrice() != null &&
                product.getSuggestedRetailSellingPrice().compareTo(BigDecimal.ZERO) != 0) {
            percentageDiff = product.getFinalSellingPriceRetail()
                    .subtract(product.getSuggestedRetailSellingPrice())
                    .divide(product.getSuggestedRetailSellingPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        boolean isLowStock;

        isLowStock = (product.getStock()!= null && product.getLowStockAlert()!=null
                && product.getStock() <= product.getLowStockAlert());

        return new ProductCostDataDTO(
                totalCost,
                percentageDiff,
                isLowStock
        );
    }

    /**
     * Extracts sort field from Pageable, defaults to "stock" if unsorted
     */
    private String getSortFieldFromPageable(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable.getSort().iterator().next().getProperty();
        }
        return "stock";
    }

    /**
     * Extracts sort direction from Pageable, defaults to ASC if unsorted
     */
    private Sort.Direction getSortDirectionFromPageable(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable.getSort().iterator().next().getDirection();
        }
        return Sort.Direction.ASC;
    }


    // =============================================================================
    // PRIVATE HELPER METHODS - Cost Calculations
    // =============================================================================

    /**
     * Calculates total material cost for a product
     */

    private BigDecimal calculateMaterialCost(Product product) {
        return product.getAllProductMaterials().stream()
                .filter(pm -> pm.getMaterial().getCurrentUnitCost() != null && pm.getQuantity() != null)
                .map(pm -> pm.getMaterial().getCurrentUnitCost().multiply(pm.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates total procedure cost for a product
     */

    private BigDecimal calculateProcedureCost(Product product) {
        return product.getAllProcedureProducts().stream()
                .filter(cost -> cost != null)
                .map(ProcedureProduct::getCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates labor cost based on minutes to make and hourly rate
     */
    private BigDecimal calculateLaborCost(Product product) {
        if (product.getMinutesToMake() == null || product.getMinutesToMake() <= 0) {
            return BigDecimal.ZERO;
        }

        // Convert minutes to hours and multiply by hourly rate
        BigDecimal hoursToMake = BigDecimal.valueOf(product.getMinutesToMake())
                .divide(MINUTES_PER_HOUR, 4, RoundingMode.HALF_UP);

        return hoursToMake.multiply(HOURLY_LABOR_RATE);
    }

    /**
     * Calculates Suggested retail price for product based on
     * costs and mark up factor.
     */

    private BigDecimal calculateSuggestedRetailPrice(Product product){

        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal procedureCost = calculateProcedureCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal totalCost = materialCost.add(laborCost).add(procedureCost);

        LOGGER.info("Price calculation for product {}: Material cost: {}, Procedure cost: {}, Labor cost: {}, Total cost: {}",
                product.getCode(), materialCost, procedureCost, laborCost, totalCost);

        return totalCost.multiply(RETAIL_MARKUP_FACTOR);
    }

    /**
     * Calculates Suggested wholesale price for product based on
     * costs and mark up factor.
     */

    private BigDecimal calculateSuggestedWholesalePrice(Product product){

        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal procedureCost = calculateProcedureCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal totalCost = materialCost.add(laborCost).add(procedureCost);

        LOGGER.info("Wholesale Price calculation for product {}: Material cost: {}, Procedure cost: {}, Labor cost: {}, Total cost: {}",
                product.getCode(), materialCost, procedureCost, laborCost, totalCost);

        return totalCost.multiply(WHOLESALE_MARKUP_FACTOR);
    }

    private BigDecimal calculateProfitMargin(BigDecimal sellingPrice, BigDecimal cost) {
        if (sellingPrice == null || sellingPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return sellingPrice.subtract(cost)
                .divide(sellingPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculatePercentageDifference(BigDecimal current, BigDecimal suggested) {
        if (current.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(suggested)
                .divide(current, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
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
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + id + " was not found"));
    }

    private void validateUniqueCode(String code) throws EntityAlreadyExistsException {
        if (productRepository.existsByCode(code)) {
            throw new EntityAlreadyExistsException("Product",
                    "Product with code " + code + " already exists");
        }
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if(productRepository.existsByName(name)) {
            throw new EntityAlreadyExistsException("Product",
                    "Product with name " + name + " already exists");
        }
    }

    private Category getCategoryById(Long categoryId) throws EntityNotFoundException {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id " + categoryId + " not found"));
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Material and Procedure Management
    // =============================================================================

    /**
     * Adds materials to product from Map during product creation
     */
    private void addMaterialsToProduct(Product product, Map<Long, BigDecimal> materials)
            throws EntityNotFoundException {

        for (Map.Entry<Long, BigDecimal> entry : materials.entrySet()) {
            Long materialId = entry.getKey();
            BigDecimal quantity = entry.getValue();

            Material material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new EntityNotFoundException("Material",
                            "Material with id " + materialId + " not found"));

            // Use helper method from Product entity
            product.addMaterial(material, quantity);

            LOGGER.debug("Added material {} with quantity {} to product {}",
                    material.getName(), quantity, product.getCode());
        }
    }

    /**
     * Adds procedures to product from Map during product creation
     */
    private void addProceduresToProduct(Product product, Map<Long, BigDecimal> procedures)
            throws EntityNotFoundException {

        for (Map.Entry<Long, BigDecimal> entry : procedures.entrySet()) {
            Long procedureId = entry.getKey();
            BigDecimal cost = entry.getValue();

            Procedure procedure = procedureRepository.findById(procedureId)
                    .orElseThrow(() -> new EntityNotFoundException("Procedure",
                            "Procedure with id " + procedureId + " not found"));


            // Use helper method from Product entity
            product.addProcedure(procedure, cost);

            LOGGER.debug("Added procedure {} with cost {} to product {}",
                    procedure.getName(), cost, product.getCode());
        }
    }

    /**
     * Clears all material relationships from product (used during deletion)
     */
    private void clearProductMaterials(Product product) {
        // Use copy to avoid ConcurrentModificationException
        Set<ProductMaterial> materials = Set.copyOf(product.getAllProductMaterials());
        for (ProductMaterial productMaterial : materials) {
            product.removeMaterial(productMaterial.getMaterial());
        }
        LOGGER.debug("Cleared {} materials from product {}",
                materials.size(), product.getCode());
    }

    /**
     * Clears all procedure relationships from product (used during deletion)
     */
    private void clearProductProcedures(Product product) {
        // Use copy to avoid ConcurrentModificationException
        Set<ProcedureProduct> procedures = Set.copyOf(product.getAllProcedureProducts());
        for (ProcedureProduct procedureProduct : procedures) {
            product.removeProcedure(procedureProduct.getProcedure());
        }
        LOGGER.debug("Cleared {} procedures from product {}",
                procedures.size(), product.getCode());
    }

    /**
     * Updates suggested pricing after material/procedure changes
     */
    private void updatePricing(Product product) throws EntityNotFoundException{
        BigDecimal newPriceRetail = calculateSuggestedRetailPrice(product);
        BigDecimal newPriceWholesale = calculateSuggestedWholesalePrice(product);

        if(!newPriceRetail.equals(product.getSuggestedRetailSellingPrice())) {
            product.setSuggestedRetailSellingPrice(newPriceRetail);
            LOGGER.info("Updated suggested retail price for product {} to {}",
                    product.getCode(), newPriceRetail);
        }

        if(!newPriceWholesale.equals(product.getSuggestedWholeSaleSellingPrice())){
            product.setSuggestedWholeSaleSellingPrice(newPriceWholesale);
            LOGGER.info("Updated suggested wholesale price for product {} to {}",
                    product.getCode(), newPriceWholesale);

        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    /**
     * Converts ProductFilters to JPA Specifications for database queries
     */

    private Specification<Product> getSpecsFromFilters(ProductFilters filters) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.productNameOrCodeLike(filters.getNameOrCode()))
                .and(ProductSpecification.productCategoryId(filters.getCategoryId()))
                .and(ProductSpecification.productRetailPriceBetween(filters.getMinPrice(), filters.getMaxPrice()))
                .and(ProductSpecification.productStockBetween(filters.getMinStock(), filters.getMaxStock()))
                .and(ProductSpecification.productIsActive(filters.getIsActive()))
                .and(ProductSpecification.productLowStock(filters.getLowStock()));

        // Material filtering
        // Priority: If materialId is provided (user selected), use ID search
        // Otherwise, use name search for autocomplete
        if (filters.getMaterialId() != null) {
            spec = spec.and(ProductSpecification.productContainsMaterialById(filters.getMaterialId()));
        } else if (filters.getMaterialName() != null && !filters.getMaterialName().trim().isEmpty()) {
            spec = spec.and(ProductSpecification.productContainsMaterialByName(filters.getMaterialName()));
        }

        // Procedure filtering (dropdown selection)
        if (filters.getProcedureId() != null) {
            spec = spec.and(ProductSpecification.productUsesProcedureById(filters.getProcedureId()));
        }

        return spec;
    }

}
