package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.CategoryFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.CategorySpecification;
import gr.aueb.cf.bluemargarita.dto.category.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Category;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.CategoryRepository;
import gr.aueb.cf.bluemargarita.repository.ProductRepository;
import gr.aueb.cf.bluemargarita.repository.SaleProductRepository;
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
import java.util.Optional;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class CategoryService implements ICategoryService{

    private static final Logger LOGGER =
            LoggerFactory.getLogger(CategoryService.class);
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SaleProductRepository saleProductRepository;
    private final Mapper mapper;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository, ProductRepository productRepository, SaleProductRepository saleProductRepository, Mapper mapper) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.saleProductRepository = saleProductRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryReadOnlyDTO createCategory(CategoryInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        validateUniqueName(dto.name());

        Category category = mapper.mapCategoryInsertToModel(dto);

        User creator = getUserEntityById(dto.creatorUserId());

        category.setCreatedBy(creator);
        category.setLastUpdatedBy(creator);

        Category insertedCategory = categoryRepository.save(category);

        LOGGER.info("Category created with id: {}", insertedCategory.getId());

        return mapper.mapToCategoryReadOnlyDTO(insertedCategory);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryReadOnlyDTO updateCategory(CategoryUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Category existingCategory = getCategoryEntityById(dto.categoryId());

        if(!existingCategory.getName().equals(dto.name())){
            validateUniqueName(dto.name());
        }

        User updater = getUserEntityById(dto.updaterUserId());

        Category updatedCategory = mapper.mapCategoryUpdateToModel(dto,
                existingCategory);

        updatedCategory.setLastUpdatedBy(updater);

        Category savedCategory = categoryRepository.save(updatedCategory);

        LOGGER.info("Category {} updated by user {}", savedCategory.getName() ,
                updater.getUsername());

        return mapper.mapToCategoryReadOnlyDTO(savedCategory);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) throws EntityNotFoundException {

        Category category = getCategoryEntityById(id);

        Integer productsCount = productRepository.countActiveByCategoryId(id);

        if(productsCount > 0){
            //Soft Delete if category is used in any products
            category.setIsActive(false);
            category.setDeletedAt(LocalDateTime.now());
            categoryRepository.save(category);

            LOGGER.info("Category {} soft deleted. Used in {} products",
                    category.getName(), productsCount);
        } else {
            //Hard delete if category not used anywhere
            categoryRepository.delete(category);
            LOGGER.info("Category {} hard deleted (not used in any products)",
                    category.getName());
        }

    }

    @Override
    @Transactional(readOnly = true)
    public CategoryReadOnlyDTO getCategoryById(Long id) throws EntityNotFoundException{

        Category category = getCategoryEntityById(id);

        return mapper.mapToCategoryReadOnlyDTO(category);
    }

    // =============================================================================
    // CATEGORY VIEW / MANAGEMENT PAGE
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public CategoryDetailedViewDTO getCategoryDetailedView(Long categoryId) throws EntityNotFoundException{

        Category category = getCategoryEntityById(categoryId);

        CategoryAnalyticsDTO analytics = getCategoryAnalytics(categoryId);
        List<ProductStatsSummaryDTO> topProducts = getTopProductsInCategory(categoryId);

        return mapper.mapToCategoryDetailedDTO(category, analytics, topProducts);

    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<CategoryReadOnlyDTO> getCategoriesFilteredPaginated(CategoryFilters filters) {
        var filtered = categoryRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToCategoryReadOnlyDTO));
    }

    // =============================================================================
    // DROPDOWN FOR PRODUCT CREATION PAGE
    // =============================================================================

    @Override
    @Transactional(readOnly = true)
    public List<CategoryForDropdownDTO> getActiveCategoriesForDropdown() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(category -> new CategoryForDropdownDTO(category.getId(), category.getName()))
                .sorted((c1, c2) -> c1.name().compareToIgnoreCase(c2.name()))
                .collect(Collectors.toList());
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private Category getCategoryEntityById(Long id) throws EntityNotFoundException {
        return categoryRepository.findById(id).orElseThrow(()->
                new EntityNotFoundException("Category", "Category with id " + id + " was not found"));
    }

    private User getUserEntityById(Long userId) throws EntityNotFoundException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id=" + userId + " was not found"));
    }

    private void validateUniqueName(String name) throws EntityAlreadyExistsException {
        if (categoryRepository.existsByName(name)) {
            throw new EntityAlreadyExistsException("Category", "Υπάρχει ήδη κατηγορία με όνομα " + name);
        }
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Analytics Calculations
    // =============================================================================

    private CategoryAnalyticsDTO getCategoryAnalytics(Long categoryId) {

        Integer totalProducts = productRepository.countActiveByCategoryId(categoryId);
        // Check if category has products first
        if (totalProducts == 0) {
            return createEmptyCategoryAnalytics();
        }

        // Product metrics
        BigDecimal averageProductPrice = productRepository.calculateAverageRetailPriceByCategoryId(categoryId);

        // All-time sales metrics
        Integer totalSalesCount = saleProductRepository.countByCategoryId(categoryId);
        if (totalSalesCount == 0) {
            return createEmptyCategoryAnalytics();
        }

        BigDecimal totalRevenue = saleProductRepository.sumRevenueByCategoryId(categoryId);
        BigDecimal averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalSalesCount), 2, RoundingMode.HALF_UP);
        LocalDate lastSaleDate = saleProductRepository.findLastSaleDateByCategoryId(categoryId);

        // Recent performance
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = saleProductRepository.countByCategoryIdAndDateRange(categoryId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = saleProductRepository.sumRevenueByCategoryIdAndDateRange(categoryId, thirtyDaysAgo, today);

        // Yearly performance
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Integer yearlySalesCount = saleProductRepository.countByCategoryIdAndDateRange(categoryId, yearStart, today);
        BigDecimal yearlySalesRevenue = saleProductRepository.sumRevenueByCategoryIdAndDateRange(categoryId, yearStart, today);

        return new CategoryAnalyticsDTO(
                totalProducts,
                averageProductPrice != null ? averageProductPrice : BigDecimal.ZERO,
                totalRevenue,
                totalSalesCount,
                averageOrderValue,
                lastSaleDate,
                recentSalesCount,
                recentRevenue,
                yearlySalesCount,
                yearlySalesRevenue
        );
    }

    private CategoryAnalyticsDTO createEmptyCategoryAnalytics() {
        return new CategoryAnalyticsDTO(
                0,                  // totalProductsInCategory
                BigDecimal.ZERO,    // averageProductPrice
                BigDecimal.ZERO,    // totalRevenue
                0,                  // totalSalesCount
                BigDecimal.ZERO,    // averageOrderValue
                null,               // lastSaleDate
                0,                  // recentSalesCount
                BigDecimal.ZERO,    // recentRevenue
                0,                  // yearlySalesCount
                BigDecimal.ZERO     // yearlySalesRevenue
        );
    }

    private List<ProductStatsSummaryDTO> getTopProductsInCategory(Long categoryId) {
        List<Long> productIds = productRepository.findProductIdsByCategoryId(categoryId);

        if(productIds.isEmpty()){
            return Collections.emptyList();
        }

        return productIds.stream()
                .limit(10)
                .map(this::getProductSalesStats)
                .flatMap(Optional::stream)
                .sorted((p1,p2)->p2.totalRevenue().compareTo(p1.totalRevenue()))
                .collect(Collectors.toList());
    }

    private Optional<ProductStatsSummaryDTO> getProductSalesStats(Long productId){
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);

        BigDecimal totalSold = saleProductRepository.sumQuantityByProductId(productId);
        if(totalSold == null || totalSold.compareTo(BigDecimal.ZERO) == 0){
            return Optional.empty();
        }
        BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductId(productId);
        LocalDate lastSaleDate = saleProductRepository.findLastSaleDateByProductId(productId);
        return Optional.of(new ProductStatsSummaryDTO(productId,productName,productCode,totalSold,totalRevenue, lastSaleDate));

    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<Category> getSpecsFromFilters(CategoryFilters filters) {
        return Specification
                .where(CategorySpecification.categoryNameLike(filters.getName()))
                .and(CategorySpecification.categoryIsActive(filters.getIsActive()));
    }

}
