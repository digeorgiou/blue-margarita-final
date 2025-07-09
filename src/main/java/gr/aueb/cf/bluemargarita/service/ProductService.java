package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final Mapper mapper;

    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, MaterialRepository materialRepository, ProcedureRepository procedureRepository, UserRepository userRepository, Mapper mapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.materialRepository = materialRepository;
        this.procedureRepository = procedureRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO createProduct(ProductInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException {

        // Validate unique constraints
        validateUniqueName(dto.name());
        validateUniqueCode(dto.code());

        // Validate category exists and is active
        Category category = validateAndGetCategory(dto.categoryId());

        // Create product
        Product product = mapper.mapProductInsertToModel(dto);
        product.setCategory(category);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

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

        return mapper.mapToProductReadOnlyDTO(savedProduct);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO updateProduct(ProductUpdateDTO dto)
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
            category = validateAndGetCategory(dto.categoryId());
        }

        // Update product fields
        Product updatedProduct = mapper.mapProductUpdateToModel(dto, existingProduct);
        if (category != null) {
            updatedProduct.setCategory(category);
        }

        User updaterUser = userRepository.findById(dto.updaterUserId()).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.updaterUserId() + " not found"));

        updatedProduct.setLastUpdatedBy(updaterUser);

        Product savedProduct = productRepository.save(updatedProduct);

        LOGGER.info("Product {} updated", savedProduct.getCode());

        return mapper.mapToProductReadOnlyDTO(savedProduct);
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



    @Override
    @Transactional(readOnly = true)
    public List<ProductReadOnlyDTO> getFilteredProducts(ProductFilters filters) {
        return productRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToProductReadOnlyDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public Paginated<ProductReadOnlyDTO> getProductsFilteredPaginated(ProductFilters filters) {
        var filtered = productRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToProductReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductReadOnlyDTO> getLowStockProducts() {
        ProductFilters filters = ProductFilters.builder()
                .lowStock(true)
                .isActive(true)
                .build();
        return getFilteredProducts(filters);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductReadOnlyDTO> getProductsByCategory(Long categoryId) {
        ProductFilters filters = ProductFilters.builder()
                .categoryId(categoryId)
                .isActive(true)
                .build();
        return getFilteredProducts(filters);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductReadOnlyDTO> getProductsInPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        ProductFilters filters = ProductFilters.builder()
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .isActive(true)
                .build();
        return getFilteredProducts(filters);
    }

    private Specification<Product> getSpecsFromFilters(ProductFilters filters) {
        return Specification
                .where(ProductSpecification.productNameLike(filters.getName()))
                .and(ProductSpecification.productCodeLike(filters.getCode()))
                .and(ProductSpecification.productCategoryNameLike(filters.getCategoryName()))
                .and(ProductSpecification.productCategoryId(filters.getCategoryId()))
                .and(ProductSpecification.productPriceBetween(filters.getMinPrice(), filters.getMaxPrice()))
                .and(ProductSpecification.productStockBetween(filters.getMinStock(), filters.getMaxStock()))
                .and(ProductSpecification.productIsActive(filters.getIsActive()))
                .and(ProductSpecification.productLowStock(filters.getLowStock()));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO updateProductStock(Long productId, Integer newStock, Long updaterUserId)
            throws EntityNotFoundException {

        Product product = getProductEntityById(productId);

        Integer oldStock = product.getStock();
        product.setStock(newStock);

        User updaterUser = userRepository.findById(updaterUserId).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + updaterUserId + " not found"));
        product.setLastUpdatedBy(updaterUser);

        Product savedProduct = productRepository.save(product);

        LOGGER.info("Product {} stock updated from {} to {}",
                product.getCode(), oldStock, newStock);

        return mapper.mapToProductReadOnlyDTO(savedProduct);
    }

    @Override
    public BigDecimal calculateSuggestedRetailPrice(Product product){

        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal totalCost = materialCost.add(laborCost);

        LOGGER.info("Price calculation for product {}: Material cost: {}, Labor cost: {}, Total cost: {}",
                product.getCode(), materialCost, laborCost, totalCost);

        return totalCost.multiply(RETAIL_MARKUP_FACTOR);
    }

    @Override
    public BigDecimal calculateSuggestedWholesalePrice(Product product){

        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal totalCost = materialCost.add(laborCost);

        LOGGER.info("Wholesale Price calculation for product {}: Material cost: {}, Labor cost: {}, Total cost: {}",
                product.getCode(), materialCost, laborCost, totalCost);

        return totalCost.multiply(WHOLESALE_MARKUP_FACTOR);
    }

    @Override
    public ProductCostBreakdownDTO getProductCostBreakdown(Long productId) throws EntityNotFoundException {

        Product product = getProductEntityById(productId);
        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        BigDecimal totalCost = materialCost.add(laborCost);

        BigDecimal suggestedRetailPrice = calculateSuggestedRetailPrice(product);
        BigDecimal suggestedWholesalePrice = calculateSuggestedWholesalePrice(product);

        // Calculate labor hours
        BigDecimal laborHours = BigDecimal.ZERO;
        if (product.getMinutesToMake() != null && product.getMinutesToMake() > 0) {
            laborHours = BigDecimal.valueOf(product.getMinutesToMake())
                    .divide(MINUTES_PER_HOUR, 2, RoundingMode.HALF_UP);
        }

        BigDecimal currentRetailPrice = product.getFinalSellingPriceRetail() != null ?
                product.getFinalSellingPriceRetail() : suggestedRetailPrice;
        BigDecimal currentWholesalePrice = product.getFinalSellingPriceWholesale() != null ?
                product.getFinalSellingPriceWholesale() : suggestedWholesalePrice;


        BigDecimal percentagePriceDifferenceRetail =  calculatePercentageDifference(
                currentRetailPrice, suggestedRetailPrice);

        BigDecimal percentagePriceDifferenceWholesale = calculatePercentageDifference(
                currentWholesalePrice, suggestedWholesalePrice);


        BigDecimal profitMarginRetail = currentRetailPrice.subtract(totalCost)
                .divide(currentRetailPrice,4 , RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        BigDecimal profitMarginWholesale = currentWholesalePrice.subtract(totalCost)
                .divide(currentWholesalePrice,4 , RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));


        return new ProductCostBreakdownDTO(
                product.getId(),
                product.getCode(),
                product.getName(),
                materialCost,
                laborCost,
                laborHours,
                HOURLY_LABOR_RATE,
                totalCost,
                suggestedRetailPrice,
                suggestedWholesalePrice,
                RETAIL_MARKUP_FACTOR,
                WHOLESALE_MARKUP_FACTOR,
                percentagePriceDifferenceRetail,
                percentagePriceDifferenceWholesale,
                profitMarginRetail,
                profitMarginWholesale,
                currentRetailPrice,
                currentWholesalePrice
        );
    }

    private BigDecimal calculatePercentageDifference(BigDecimal current, BigDecimal suggested) {
        if (current.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(suggested)
                .divide(current, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }



    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO addMaterialToProduct(Long productId, Long materialId,
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

        LOGGER.info("Added material {} (quantity: {}) to product {}",
                material.getName(), quantity, product.getCode());

        return mapper.mapToProductReadOnlyDTO(savedProduct);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO removeMaterialFromProduct(Long productId, Long materialId, Long updaterUserId)
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

        LOGGER.info("Removed material {} from product {}",
                material.getName(), product.getCode());

        return mapper.mapToProductReadOnlyDTO(savedProduct);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO addProcedureToProduct(Long productId, Long procedureId,
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

        LOGGER.info("Added procedure {} (cost: {}) to product {}",
                procedure.getName(), cost, product.getCode());

        return mapper.mapToProductReadOnlyDTO(savedProduct);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReadOnlyDTO removeProcedureFromProduct(Long productId, Long procedureId, Long updaterUserId)
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

        LOGGER.info("Removed procedure {} from product {}",
                procedure.getName(), product.getCode());

        return mapper.mapToProductReadOnlyDTO(savedProduct);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriceRecalculationResultDTO recalculateAllProductPrices(Long updaterUserId) throws EntityNotFoundException {

        // Validate updater user exists
        User updaterUser = userRepository.findById(updaterUserId)
                .orElseThrow(() -> new EntityNotFoundException("User",
                        "User with id " + updaterUserId + " not found"));

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

    // Validation Methods

    private Product getProductEntityById(Long id) throws EntityNotFoundException {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product",
                        "Product with id=" + id + " was not found"));
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

    private Category validateAndGetCategory(Long categoryId) throws EntityNotFoundException {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id " + categoryId + " not found"));
    }

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



    // Helper Methods for Managing Relationships

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


    private void clearProductMaterials(Product product) {
        // Use copy to avoid ConcurrentModificationException
        Set<ProductMaterial> materials = Set.copyOf(product.getAllProductMaterials());
        for (ProductMaterial productMaterial : materials) {
            product.removeMaterial(productMaterial.getMaterial());
        }
        LOGGER.debug("Cleared {} materials from product {}",
                materials.size(), product.getCode());
    }

    private void clearProductProcedures(Product product) {
        // Use copy to avoid ConcurrentModificationException
        Set<ProcedureProduct> procedures = Set.copyOf(product.getAllProcedureProducts());
        for (ProcedureProduct procedureProduct : procedures) {
            product.removeProcedure(procedureProduct.getProcedure());
        }
        LOGGER.debug("Cleared {} procedures from product {}",
                procedures.size(), product.getCode());
    }

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


}
