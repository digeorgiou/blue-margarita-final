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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import java.util.Objects;
import java.util.stream.Collectors;

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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryReadOnlyDTO createCategory(CategoryInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (categoryRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Category", "Category with" +
                    " name " + dto.name() + " already exists");
        }

        Category category = mapper.mapCategoryInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User " +
                        "with id " + dto.creatorUserId() + " not found"));

        category.setCreatedBy(creator);
        category.setLastUpdatedBy(creator);

        Category insertedCategory = categoryRepository.save(category);

        LOGGER.info("Category created with id: {}", insertedCategory.getId());

        return mapper.mapToCategoryReadOnlyDTO(insertedCategory);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryReadOnlyDTO updateCategory(CategoryUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Category existingCategory = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + dto.categoryId() + " was not " +
                                "found"));

        if (!existingCategory.getName().equals(dto.name()) && categoryRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Category", "Category with" +
                    " name " + dto.name() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User",
                        "Updater user with id=" + dto.categoryId() + " was " +
                                "not found"));

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

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + id + " was not found"));

        if(!category.getAllProducts().isEmpty()){
            //Soft Delete if category is used in any products
            category.setIsActive(false);
            category.setDeletedAt(LocalDateTime.now());
            categoryRepository.save(category);

            LOGGER.info("Category {} soft deleted. Used in {} products",
                    category.getName(), category.getAllProducts().size());
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

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + id + " was not found"));

        return mapper.mapToCategoryReadOnlyDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryReadOnlyDTO> getAllCategories() {

        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(mapper::mapToCategoryReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryReadOnlyDTO> getAllActiveCategories() {

        return categoryRepository.findByIsActiveTrue().stream()
                .map(mapper::mapToCategoryReadOnlyDTO)
                .collect(Collectors.toList());
    }

    public CategoryDetailedViewDTO getCategoryDetailedView(Long categoryId) throws EntityNotFoundException{

        Category category = getCategoryEntityById(categoryId);

        CategoryAnalyticsDTO analytics = getCategoryAnalytics(categoryId);
        List<ProductStatsSummaryDTO> topProducts = getTopProductsInCategory(categoryId);

        return mapper.mapToCategoryDetailedDTO(category, analytics, topProducts);

    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryForDropdownDTO> getActiveCategoriesForDropdown() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(category -> new CategoryForDropdownDTO(category.getId(), category.getName()))
                .sorted((c1, c2) -> c1.name().compareToIgnoreCase(c2.name()))
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public boolean nameExists(String name) {
        return categoryRepository.existsByName(name);
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

    private Category getCategoryEntityById(Long id) throws EntityNotFoundException {
        return categoryRepository.findById(id).orElseThrow(()->
                new EntityNotFoundException("Category", "Category with id " + id + " was not found"));
    }

    private CategoryAnalyticsDTO getCategoryAnalytics(Long categoryId) {

        Integer totalProducts = categoryRepository.countActiveProductsByCategoryId(categoryId);
        // Check if category has products first
        if (totalProducts == 0) {
            return createEmptyCategoryAnalytics();
        }

        // Product metrics
        BigDecimal averageProductPrice = categoryRepository.calculateAverageRetailPriceByCategoryId(categoryId);

        // All-time sales metrics (like your customer all-time metrics)
        Integer totalSalesCount = categoryRepository.countSalesByCategoryId(categoryId);
        if (totalSalesCount == 0) {
            return createEmptyCategoryAnalytics();
        }

        BigDecimal totalRevenue = categoryRepository.sumRevenueByCategoryId(categoryId);
        BigDecimal averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalSalesCount), 2, RoundingMode.HALF_UP);
        LocalDate lastSaleDate = categoryRepository.findLastSaleDateByCategoryId(categoryId);

        // Recent performance (exact same pattern as customer)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        Integer recentSalesCount = categoryRepository.countSalesByCategoryIdAndDateRange(categoryId, thirtyDaysAgo, today);
        BigDecimal recentRevenue = categoryRepository.sumRevenueByCategoryIdAndDateRange(categoryId, thirtyDaysAgo, today);

        // Yearly performance (exact same pattern as customer)
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Integer yearlySalesCount = categoryRepository.countSalesByCategoryIdAndDateRange(categoryId, yearStart, today);
        BigDecimal yearlySalesRevenue = categoryRepository.sumRevenueByCategoryIdAndDateRange(categoryId, yearStart, today);

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
                .filter(Objects::nonNull)
                .sorted((p1,p2)->p2.totalRevenue().compareTo(p1.totalRevenue()))
                .collect(Collectors.toList());
    }

    private ProductStatsSummaryDTO getProductSalesStats(Long productId){
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);

        BigDecimal totalSold = saleProductRepository.sumQuantityByProductId(productId);
        if(totalSold == null || totalSold.compareTo(BigDecimal.ZERO) == 0){
            return createEmptyStatsSummary(productId);
        }
        BigDecimal totalRevenue = saleProductRepository.sumRevenueByProductId(productId);
        LocalDate lastSaleDate = saleProductRepository.findLastSaleDateByProductId(productId);
        return new ProductStatsSummaryDTO(productId,productName,productCode,totalSold,totalRevenue, lastSaleDate);

    }

    private ProductStatsSummaryDTO createEmptyStatsSummary(Long productId){
        String productName = productRepository.findProductNameById(productId);
        String productCode = productRepository.findProductCodeById(productId);

        return new ProductStatsSummaryDTO(
                productId,productName,productCode,BigDecimal.ZERO, BigDecimal.ZERO, null
        );
    }



    private Specification<Category> getSpecsFromFilters(CategoryFilters filters) {
        return Specification
                .where(CategorySpecification.categoryNameLike(filters.getName()))
                .and(CategorySpecification.categoryIsActive(filters.getIsActive()));
    }

}
