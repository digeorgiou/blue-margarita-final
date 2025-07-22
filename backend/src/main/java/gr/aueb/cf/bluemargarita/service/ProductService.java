package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.PricingIssueType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ProductSpecification;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
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
    private final ProductProcedureRepository productProcedureRepository;
    private final UserRepository userRepository;
    private final SaleProductRepository saleProductRepository;

    private final ProductSalesAnalyticsService analyticsService;
    private final Mapper mapper;

    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, MaterialRepository materialRepository, ProcedureRepository procedureRepository,
                          ProductProcedureRepository productProcedureRepository, UserRepository userRepository,SaleProductRepository saleProductRepository, ProductSalesAnalyticsService analyticsService, Mapper mapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.materialRepository = materialRepository;
        this.procedureRepository = procedureRepository;
        this.productProcedureRepository = productProcedureRepository;
        this.userRepository = userRepository;
        this.saleProductRepository = saleProductRepository;
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

        // Validate category and user exist and is active
        Category category = getCategoryEntityById(dto.categoryId());
        User creator = getUserEntityById(dto.creatorUserId());

        // Create product
        Product product = createBaseProduct(dto, category, creator);

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

        updateProductPricing(savedProduct);

        // Save again with relationships and pricing
        savedProduct = productRepository.save(savedProduct);

        LOGGER.info("Product created with id: {} and productCode: {}",
                savedProduct.getId(), savedProduct.getCode());

        ProductCostDataDTO data = calculateProductCostData(savedProduct);

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

        // Validate unique productCode if changed
        if (!existingProduct.getCode().equals(dto.code())) {
            validateUniqueCode(dto.code());
        }

        // Validate category if changed
        Category category = null;
        if (!existingProduct.getCategory().getId().equals(dto.categoryId())) {
            category = getCategoryEntityById(dto.categoryId());
        }

        // Update product fields
        Product updatedProduct = mapper.mapProductUpdateToModel(dto, existingProduct);
        if (category != null) {
            updatedProduct.setCategory(category);
        }
        User updaterUser = getUserEntityById(dto.updaterUserId());

        updateProductFields(existingProduct, dto, category, updaterUser);

        Product savedProduct = productRepository.save(updatedProduct);

        ProductCostDataDTO data = getDataDTOForProduct(savedProduct);

        LOGGER.info("Product {} updated", savedProduct.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(Long id) throws EntityNotFoundException {

        Product product = getProductEntityById(id);

        Integer saleCount = saleProductRepository.countSalesByProductId(id);

        if (saleCount > 0) {
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
    // PRODUCT MANAGEMENT AND DETAILED VIEW
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductListItemDTO> getProductListItemsPaginated(ProductFilters filters) {
        Page<Product> filtered = productRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );

        Page<ProductListItemDTO> mappedPage = filtered.map(product -> {
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

    // =============================================================================
    // PRODUCT AUTOCOMPLETE SEARCH FOR RECORD SALE PAGE
    // =============================================================================


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
    // SALES ANALYTICS FOR SPECIFIC PRODUCT
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public ProductSalesAnalyticsDTO getProductSalesAnalytics(Long productId,
                                                             LocalDate startDate,
                                                             LocalDate endDate)
            throws EntityNotFoundException {
        return analyticsService.getProductSalesAnalytics(productId, startDate, endDate);
    }

    // =============================================================================
    // DASHBOARD PAGE METHODS
    // =============================================================================

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
            throws EntityNotFoundException , EntityInvalidArgumentException {

        validateMaterialQuantity(quantity);

        Product product = getProductEntityById(productId);
        Material material = getMaterialEntityById(materialId);
        User updaterUser = getUserEntityById(updaterUserId);

        // Remove existing if present, then add new
        product.removeMaterial(material);
        product.addMaterial(material, quantity);

        product.setLastUpdatedBy(updaterUser);
        updateProductPricing(product);

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
        Material material = getMaterialEntityById(materialId);
        User updaterUser = getUserEntityById(updaterUserId);

        product.removeMaterial(material);

        product.setLastUpdatedBy(updaterUser);
        updateProductPricing(product);

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
            throws EntityNotFoundException , EntityInvalidArgumentException {

        validateProcedureCost(cost);

        Product product = getProductEntityById(productId);
        Procedure procedure = getProcedureEntityById(procedureId);
        User updater = getUserEntityById(updaterUserId);

        // Remove existing if present, then add new
        product.removeProcedure(procedure);
        product.addProcedure(procedure, cost);

        product.setLastUpdatedBy(updater);
        updateProductPricing(product);

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
        Procedure procedure = getProcedureEntityById(procedureId);
        User updater = getUserEntityById(updaterUserId);

        product.removeProcedure(procedure);

        product.setLastUpdatedBy(updater);
        updateProductPricing(product);

        Product savedProduct = productRepository.save(product);
        ProductCostDataDTO data = getDataDTOForProduct(product);

        LOGGER.info("Removed procedure {} from product {}",
                procedure.getName(), product.getCode());

        return mapper.mapToProductListItemDTO(savedProduct, data);
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
    // WRONG PRICING ALERTS
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<MispricedProductAlertDTO> getMispricedProductsAlert(BigDecimal thresholdPercentage, int limit) {
        Pageable pageable = PageRequest.of(0, limit * 2);
        List<Product> productsWithIssues = productRepository.findProductsWithAnyPricingIssues(thresholdPercentage, pageable);

        List<MispricedProductAlertDTO> mispricedProducts = productsWithIssues.stream()
                .map(product -> createMispricedProductAlertDTO(product, thresholdPercentage))
                .filter(Objects::nonNull)
                .sorted((p1,p2)->p2.priceDifferencePercentage().compareTo(p1.priceDifferencePercentage()))
                .limit(limit)
                .collect(Collectors.toList());

        LOGGER.info("Found {} mispriced products out of {} candidates",
                mispricedProducts.size(), productsWithIssues.size());

        return mispricedProducts;
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<MispricedProductAlertDTO> getAllMispricedProductsPaginated(BigDecimal thresholdPercentage, Pageable pageable) {
        // We multiply by 3 to account for products that might be filtered out
        int batchSize = Math.max(1000, (pageable.getPageNumber() + 1) * pageable.getPageSize() * 3);
        Pageable candidatePageable = PageRequest.of(0, batchSize);

        // Get candidate products with potential pricing issues
        List<Product> candidateProducts = productRepository.findProductsWithAnyPricingIssues(thresholdPercentage, candidatePageable);

        // Convert to DTOs and filter out products that don't meet our criteria
        // Remove products that don't have significant pricing issues
        List<MispricedProductAlertDTO> allMispricedProducts = candidateProducts.stream()
                .map(product -> createMispricedProductAlertDTO(product, thresholdPercentage))
                .filter(Objects::nonNull).sorted((p1, p2) -> {
                    // Compare by absolute value of price difference (most significant issues first)
                    BigDecimal p1MaxDiff = p1.priceDifferencePercentage().abs()
                            .max(p1.wholesalePriceDifferencePercentage().abs());
                    BigDecimal p2MaxDiff = p2.priceDifferencePercentage().abs()
                            .max(p2.wholesalePriceDifferencePercentage().abs());
                    return p2MaxDiff.compareTo(p1MaxDiff);
                }).collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allMispricedProducts.size());

        List<MispricedProductAlertDTO> pageContent = new ArrayList<>();
        if (start < allMispricedProducts.size()) {
            pageContent = allMispricedProducts.subList(start, end);
        }

        return new Paginated<>(
                pageContent,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                allMispricedProducts.size()
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

    // =============================================================================
    // PRIVATE HELPER METHODS - Product Creation and Management
    // =============================================================================

    private Product createBaseProduct(ProductInsertDTO dto, Category category, User creator) {
        Product product = mapper.mapProductInsertToModel(dto);
        product.setCategory(category);
        product.setCreatedBy(creator);
        product.setLastUpdatedBy(creator);
        return product;
    }

    private void updateProductFields(Product product, ProductUpdateDTO dto, Category category, User updater) {
        Product updatedProduct = mapper.mapProductUpdateToModel(dto, product);
        if (category != null) {
            updatedProduct.setCategory(category);
        }
        updatedProduct.setLastUpdatedBy(updater);
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
                    "Product with productCode " + code + " already exists");
        }
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if(productRepository.existsByName(name)) {
            throw new EntityAlreadyExistsException("Product",
                    "Product with name " + name + " already exists");
        }
    }

    private Category getCategoryEntityById(Long id) throws EntityNotFoundException {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + id + " was not found"));
    }

    private Material getMaterialEntityById(Long id) throws EntityNotFoundException {
        return materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material",
                        "Material with id=" + id + " was not found"));
    }

    private Procedure getProcedureEntityById(Long id) throws EntityNotFoundException {
        return procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure",
                        "Procedure with id=" + id + " was not found"));
    }

    /**
     * Validates material quantity - must be positive with max 6 digits, 2 decimals
     */
    private void validateMaterialQuantity(BigDecimal quantity) throws EntityInvalidArgumentException{
        if (quantity == null) {
            throw new EntityInvalidArgumentException("Material","Η ποσότητα υλικού είναι απαραίτητη");
        }

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new EntityInvalidArgumentException("Material","Η ποσότητα υλικού πρέπει να είναι μεγαλύτερη από 0");
        }

        // Check scale (decimal places)
        if (quantity.scale() > 2) {
            throw new EntityInvalidArgumentException("Material","Η ποσότητα υλικού μπορεί να έχει μέχρι 2 δεκαδικά ψηφία");
        }

        // Check precision (total digits)
        String quantityStr = quantity.stripTrailingZeros().toPlainString().replace(".", "");
        if (quantityStr.length() > 6) {
            throw new EntityInvalidArgumentException("Material","Η ποσότητα υλικού μπορεί να έχει μέχρι 6 ψηφία συνολικά");
        }
    }

    /**
     * Validates procedure cost - must be positive with max 6 digits, 2 decimals
     */
    private void validateProcedureCost(BigDecimal cost) throws EntityInvalidArgumentException{
        if (cost == null) {
            throw new EntityInvalidArgumentException("Procedure","Το κόστος διαδικασίας είναι απαραίτητο");
        }

        if (cost.compareTo(BigDecimal.ZERO) <= 0) {
            throw new EntityInvalidArgumentException("Procedure","Το κόστος διαδικασίας πρέπει να είναι μεγαλύτερο από 0");
        }

        // Check scale (decimal places)
        if (cost.scale() > 2) {
            throw new EntityInvalidArgumentException("Procedure","Το κόστος διαδικασίας μπορεί να έχει μέχρι 2 δεκαδικά ψηφία");
        }

        // Check precision (total digits)
        String costStr = cost.stripTrailingZeros().toPlainString().replace(".", "");
        if (costStr.length() > 8) {
            throw new EntityInvalidArgumentException("Procedure","Το κόστος διαδικασίας μπορεί να έχει μέχρι 6 ψηφία συνολικά");
        }
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
        Set<ProductProcedure> procedures = Set.copyOf(product.getAllProcedureProducts());
        for (ProductProcedure productProcedure : procedures) {
            product.removeProcedure(productProcedure.getProcedure());
        }
        LOGGER.debug("Cleared {} procedures from product {}",
                procedures.size(), product.getCode());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Pricing Calculations
    // =============================================================================

    private void updateProductPricing(Product product) {
        BigDecimal newRetailPrice = calculateSuggestedRetailPrice(product);
        BigDecimal newWholesalePrice = calculateSuggestedWholesalePrice(product);

        product.setSuggestedRetailSellingPrice(newRetailPrice);
        product.setSuggestedWholeSaleSellingPrice(newWholesalePrice);

        LOGGER.debug("Updated pricing for product {} - Retail: {}, Wholesale: {}",
                product.getCode(), newRetailPrice, newWholesalePrice);
    }

    private BigDecimal calculateSuggestedRetailPrice(Product product) {
        BigDecimal totalCost = calculateTotalProductCost(product);
        return totalCost.multiply(RETAIL_MARKUP_FACTOR);
    }

    private BigDecimal calculateSuggestedWholesalePrice(Product product) {
        BigDecimal totalCost = calculateTotalProductCost(product);
        return totalCost.multiply(WHOLESALE_MARKUP_FACTOR);
    }

    private BigDecimal calculateTotalProductCost(Product product) {
        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal procedureCost = calculateProcedureCost(product);
        return materialCost.add(laborCost).add(procedureCost);
    }

    private BigDecimal calculateMaterialCost(Product product) {
        return product.getAllProductMaterials().stream()
                .filter(pm -> pm.getMaterial().getCurrentUnitCost() != null && pm.getQuantity() != null)
                .map(pm -> pm.getMaterial().getCurrentUnitCost().multiply(pm.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateLaborCost(Product product) {
        if (product.getMinutesToMake() == null || product.getMinutesToMake() <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal hoursToMake = BigDecimal.valueOf(product.getMinutesToMake())
                .divide(MINUTES_PER_HOUR, 4, RoundingMode.HALF_UP);

        return hoursToMake.multiply(HOURLY_LABOR_RATE);
    }

    private BigDecimal calculateProcedureCost(Product product) {
        return productProcedureRepository.sumCostByProductId(product.getId());
    }

    private BigDecimal calculatePercentageDifference(BigDecimal current, BigDecimal suggested) {
        if (current.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(suggested)
                .divide(current, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }


    private BigDecimal calculateProfitMargin(BigDecimal sellingPrice, BigDecimal cost) {
        if (sellingPrice == null || sellingPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return sellingPrice.subtract(cost)
                .divide(sellingPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<Product> getSpecsFromFilters(ProductFilters filters) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.productNameOrCodeLike(filters.getNameOrCode()))
                .and(ProductSpecification.productCategoryId(filters.getCategoryId()))
                .and(ProductSpecification.productRetailPriceBetween(filters.getMinPrice(), filters.getMaxPrice()))
                .and(ProductSpecification.productStockBetween(filters.getMinStock(), filters.getMaxStock()))
                .and(ProductSpecification.productIsActive(filters.getIsActive()))
                .and(ProductSpecification.productLowStock(filters.getLowStock()));

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

    // =============================================================================
    // PRIVATE HELPER METHODS - Data Calculations and Mapping
    // =============================================================================

    private ProductCostDataDTO calculateProductCostData(Product product) {
        BigDecimal totalCost = calculateMaterialCost(product).add(calculateProcedureCost(product));

        BigDecimal percentageDiff = BigDecimal.ZERO;
        if (product.getSuggestedRetailSellingPrice() != null &&
                product.getSuggestedRetailSellingPrice().compareTo(BigDecimal.ZERO) != 0) {
            percentageDiff = product.getFinalSellingPriceRetail()
                    .subtract(product.getSuggestedRetailSellingPrice())
                    .divide(product.getSuggestedRetailSellingPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        boolean isLowStock = (product.getStock() != null && product.getLowStockAlert() != null
                && product.getStock() <= product.getLowStockAlert());

        return new ProductCostDataDTO(totalCost, percentageDiff, isLowStock);
    }


    // =============================================================================
    // PRIVATE HELPER METHODS - Mispricing calculations
    // =============================================================================

    private MispricedProductAlertDTO createMispricedProductAlertDTO(Product product, BigDecimal thresholdPercentage) {

        // Calculate percentage differences
        BigDecimal retailDifference = calculatePriceDifferencePercentage(
                product.getSuggestedRetailSellingPrice(),
                product.getFinalSellingPriceRetail()
        );

        BigDecimal wholesaleDifference = calculatePriceDifferencePercentage(
                product.getSuggestedWholeSaleSellingPrice(),
                product.getFinalSellingPriceWholesale()
        );

        if (retailDifference.abs().compareTo(thresholdPercentage) < 0 &&
                wholesaleDifference.abs().compareTo(thresholdPercentage) < 0) {
            return null; // Neither price difference is significant enough
        }

        // Determine issue type
        PricingIssueType issueType = determinePricingIssueType(
                retailDifference, wholesaleDifference, thresholdPercentage
        );

        return new MispricedProductAlertDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory() != null ? product.getCategory().getName() : "No Category",
                product.getSuggestedRetailSellingPrice(),
                product.getFinalSellingPriceRetail(),
                retailDifference,
                product.getSuggestedWholeSaleSellingPrice(),
                product.getFinalSellingPriceWholesale(),
                wholesaleDifference,
                issueType
        );
    }

    private BigDecimal calculatePriceDifferencePercentage(BigDecimal suggestedPrice, BigDecimal finalPrice) {
        return suggestedPrice.subtract(finalPrice)
                .divide(finalPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private PricingIssueType determinePricingIssueType(
            BigDecimal retailDifference,
            BigDecimal wholesaleDifference,
            BigDecimal threshold) {

        boolean retailUnderpriced = retailDifference.compareTo(threshold) >= 0;
        boolean wholesaleUnderpriced = wholesaleDifference.compareTo(threshold) >= 0;

        if (retailUnderpriced && wholesaleUnderpriced) {
            return PricingIssueType.BOTH_UNDERPRICED;
        } else if (retailUnderpriced) {
            return PricingIssueType.RETAIL_UNDERPRICED;
        } else if (wholesaleUnderpriced) {
            return PricingIssueType.WHOLESALE_UNDERPRICED;
        } else return PricingIssueType.NO_ISSUES;
    }

}
