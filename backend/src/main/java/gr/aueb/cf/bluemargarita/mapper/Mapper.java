package gr.aueb.cf.bluemargarita.mapper;

import gr.aueb.cf.bluemargarita.core.enums.Role;
import gr.aueb.cf.bluemargarita.core.enums.StockStatus;
import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import gr.aueb.cf.bluemargarita.dto.category.*;
import gr.aueb.cf.bluemargarita.dto.customer.*;
import gr.aueb.cf.bluemargarita.dto.expense.ExpenseReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.*;
import gr.aueb.cf.bluemargarita.dto.material.*;
import gr.aueb.cf.bluemargarita.dto.procedure.*;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseMaterialDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseMaterialDetailDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleItemDetailsDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleProductDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockAlertDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockManagementDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.*;
import gr.aueb.cf.bluemargarita.dto.task.ToDoTaskReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class Mapper {

    // Category

    public Category mapCategoryInsertToModel(CategoryInsertDTO dto){
            return Category.builder()
                    .name(dto.name())
                    .isActive(true)
                    .build();
    }

    public Category mapCategoryUpdateToModel(CategoryUpdateDTO dto,
                                             Category existingCategory){
        existingCategory.setName(dto.name());
        return existingCategory;
    }

    public CategoryReadOnlyDTO mapToCategoryReadOnlyDTO(Category category){
        return new CategoryReadOnlyDTO(
                category.getId(),
                category.getName(),
                category.getCreatedAt(),
                category.getUpdatedAt(),
                category.getCreatedBy().getUsername(),
                category.getLastUpdatedBy().getUsername(),
                category.getIsActive(),
                category.getDeletedAt()
        );
    }

    public CategoryDetailedViewDTO mapToCategoryDetailedDTO(Category category,
                                                                CategoryAnalyticsDTO analytics,
                                                                List<ProductStatsSummaryDTO> topProducts) {
        return new CategoryDetailedViewDTO(
                category.getId(),
                category.getName(),
                category.getCreatedAt(),
                category.getUpdatedAt(),
                category.getCreatedBy() != null ? category.getCreatedBy().getUsername() : "system",
                category.getLastUpdatedBy() != null ? category.getLastUpdatedBy().getUsername() : "system",
                category.getIsActive(),
                category.getDeletedAt(),

                // Analytics data
                analytics.totalProductsInCategory(),
                analytics.averageProductPrice(),
                analytics.totalRevenue(),
                analytics.totalSalesCount(),
                analytics.averageOrderValue(),
                analytics.lastSaleDate(),
                analytics.recentSalesCount(),
                analytics.recentRevenue(),
                analytics.yearlySalesCount(),
                analytics.yearlySalesRevenue(),

                topProducts
        );
    }

    // Customer

    public Customer mapCustomerInsertToModel(CustomerInsertDTO dto){
        return Customer.builder()
                .firstname(dto.firstname())
                .lastname(dto.lastname())
                .gender(dto.gender())
                .phoneNumber(normalizeOptionalStringField(dto.phoneNumber()))
                .address(normalizeOptionalStringField(dto.address()))
                .email(normalizeOptionalStringField(dto.email()))
                .tin(normalizeOptionalStringField(dto.tin()))
                .isActive(true)
                .build();
    }

    public Customer mapCustomerUpdateToModel(CustomerUpdateDTO dto, Customer existingCustomer){
        existingCustomer.setFirstname(dto.firstname());
        existingCustomer.setLastname(dto.lastname());
        existingCustomer.setGender(dto.gender());
        existingCustomer.setPhoneNumber(dto.phoneNumber());
        existingCustomer.setAddress(dto.address());
        existingCustomer.setEmail(dto.email());
        existingCustomer.setTin(dto.tin());
        return existingCustomer;
    }

    public CustomerListItemDTO mapToCustomerListItemDTO(Customer customer) {
        return new CustomerListItemDTO(
                customer.getId(),
                customer.getFirstname(),
                customer.getLastname(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getEmail(),
                customer.getTin(),
                customer.getGender()
        );
    }

    public CustomerDetailedViewDTO mapToCustomerDetailedViewDTO(Customer customer, CustomerAnalyticsDTO analytics, List<ProductStatsSummaryDTO> topProducts){

            return new CustomerDetailedViewDTO(
                customer.getId(),
                customer.getFirstname(),
                customer.getLastname(),
                customer.getFullName(),
                customer.getGender(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getEmail(),
                customer.getTin(),
                customer.getCreatedAt(),
                customer.getUpdatedAt(),
                customer.getCreatedBy() != null ? customer.getCreatedBy().getUsername() : "system",
                customer.getLastUpdatedBy() != null ? customer.getLastUpdatedBy().getUsername() : "system",
                customer.getIsActive(),
                customer.getDeletedAt(),
                customer.getFirstSaleDate(),
                analytics.totalRevenue(),
                analytics.totalSales(),
                analytics.averageOrderValue(),
                analytics.lastOrderDate(),
                analytics.recentSalesCount(),
                analytics.recentRevenue(),
                analytics.yearlySalesCount(),
                analytics.yearlySalesRevenue(),
                topProducts
        );
    }

    //Expense

    public ExpenseReadOnlyDTO mapToExpenseReadOnlyDTO(Expense expense) {
        Purchase purchase = expense.getPurchase();

        return new ExpenseReadOnlyDTO(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getExpenseDate(),
                expense.getExpenseType(),
                purchase != null ? purchase.getId() : null,
                purchase != null ? createPurchaseDescription(purchase) : null,
                expense.getCreatedAt(),
                expense.getCreatedBy() != null ? expense.getCreatedBy().getUsername() : "system"
        );
    }

    private String createPurchaseDescription(Purchase purchase) {
        if (purchase.getSupplier() != null) {
            return purchase.getSupplier().getName() + " - " + purchase.getPurchaseDate();
        }
        return "Purchase " + purchase.getId() + " - " + purchase.getPurchaseDate();
    }


    // Location

    public Location mapLocationInsertToModel(LocationInsertDTO dto){
        return Location.builder()
                .name(dto.name())
                .isActive(true)
                .build();
    }

    public Location mapLocationUpdateToModel(LocationUpdateDTO dto, Location existingLocation){
        existingLocation.setName(dto.name());
        return existingLocation;
    }

    public LocationReadOnlyDTO mapToLocationReadOnlyDTO(Location location){
        return new LocationReadOnlyDTO(
                location.getId(),
                location.getName(),
                location.getCreatedAt(),
                location.getUpdatedAt(),
                location.getCreatedBy().getUsername(),
                location.getLastUpdatedBy().getUsername(),
                location.getIsActive(),
                location.getDeletedAt()
        );
    }

    public LocationDetailedViewDTO mapToLocationDetailedDTO(Location location,
                                                            LocationAnalyticsDTO analytics,
                                                            List<ProductStatsSummaryDTO> topProducts) {
        return new LocationDetailedViewDTO(
                location.getId(),
                location.getName(),
                location.getCreatedAt(),
                location.getUpdatedAt(),
                location.getCreatedBy() != null ? location.getCreatedBy().getUsername() : "system",
                location.getLastUpdatedBy() != null ? location.getLastUpdatedBy().getUsername() : "system",
                location.getIsActive(),
                location.getDeletedAt(),

                // Analytics data
                analytics.totalRevenue(),
                analytics.totalSalesCount(),
                analytics.averageOrderValue(),
                analytics.lastSaleDate(),
                analytics.recentSalesCount(),
                analytics.recentRevenue(),
                analytics.yearlySalesCount(),
                analytics.yearlySalesRevenue(),
                topProducts
        );
    }

    // Material

    public Material mapMaterialInsertToModel(MaterialInsertDTO dto){
        return Material.builder()
                .name(dto.name())
                .currentUnitCost(dto.currentUnitCost())
                .unitOfMeasure(dto.unitOfMeasure())
                .isActive(true)
                .build();
    }

    public Material mapMaterialUpdateToModel(MaterialUpdateDTO dto, Material existingMaterial){
        existingMaterial.setName(dto.name());
        existingMaterial.setCurrentUnitCost(dto.currentUnitCost());
        existingMaterial.setUnitOfMeasure(dto.unitOfMeasure());
        return existingMaterial;
    }

    public MaterialReadOnlyDTO mapToMaterialReadOnlyDTO(Material material){
        return new MaterialReadOnlyDTO(
                material.getId(),
                material.getName(),
                material.getCurrentUnitCost(),
                material.getUnitOfMeasure(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getCreatedBy().getUsername(),
                material.getLastUpdatedBy().getUsername(),
                material.getIsActive(),
                material.getDeletedAt()
        );
    }

    public MaterialDetailedViewDTO mapToMaterialDetailedViewDTO(Material material,
                                                                MaterialAnalyticsDTO analytics,
                                                                List<ProductUsageDTO> topProductsUsage,
                                                                List<CategoryUsageDTO> categoryDistribution) {
        return new MaterialDetailedViewDTO(
                material.getId(),
                material.getName(),
                material.getUnitOfMeasure(),
                material.getCurrentUnitCost(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getCreatedBy() != null ? material.getCreatedBy().getUsername() : "system",
                material.getLastUpdatedBy() != null ? material.getLastUpdatedBy().getUsername() : "system",
                material.getIsActive(),
                material.getDeletedAt(),

                // Analytics data
                analytics.totalProductsUsing(),
                analytics.averageCostPerProduct(),
                analytics.purchaseCount(),
                analytics.lastPurchaseDate(),
                analytics.recentPurchaseQuantity(),
                analytics.yearlyPurchaseQuantity(),
                analytics.thisYearAveragePurchasePrice(),
                analytics.lastYearAveragePurchasePrice(),
                analytics.totalRevenue(),
                analytics.totalSalesCount(),
                analytics.lastSaleDate(),
                analytics.recentSalesCount(),
                analytics.recentRevenue(),
                analytics.yearlySalesCount(),
                analytics.yearlySalesRevenue(),

                categoryDistribution,
                topProductsUsage

        );
    }

    // Procedure

    public Procedure mapProcedureInsertToModel(ProcedureInsertDTO dto){
        return Procedure.builder()
                .name(dto.name())
                .isActive(true)
                .build();
    }

    public Procedure mapProcedureUpdateToModel(ProcedureUpdateDTO dto, Procedure existingProcedure){
        existingProcedure.setName(dto.name());
        return existingProcedure;
    }

    public ProcedureReadOnlyDTO mapToProcedureReadOnlyDTO(Procedure procedure){
        return new ProcedureReadOnlyDTO(
                procedure.getId(),
                procedure.getName(),
                procedure.getCreatedAt(),
                procedure.getUpdatedAt(),
                procedure.getCreatedBy().getUsername(),
                procedure.getLastUpdatedBy().getUsername(),
                procedure.getIsActive(),
                procedure.getDeletedAt()
        );
    }

    public ProcedureDetailedViewDTO mapToProcedureDetailedDTO(Procedure procedure,
                                                          ProcedureAnalyticsDTO analytics,
                                                          List<CategoryUsageDTO> categoryDistribution,
                                                          List<ProductUsageDTO> topProductsUsage) {
        return new ProcedureDetailedViewDTO(
                procedure.getId(),
                procedure.getName(),
                procedure.getCreatedAt(),
                procedure.getUpdatedAt(),
                procedure.getCreatedBy() != null ? procedure.getCreatedBy().getUsername() : "system",
                procedure.getLastUpdatedBy() != null ? procedure.getLastUpdatedBy().getUsername() : "system",
                procedure.getIsActive(),
                procedure.getDeletedAt(),

                // Analytics data
                analytics.totalProductsUsing(),
                analytics.averageProcedureCost(),
                analytics.averageProductSellingPrice(),
                analytics.totalSalesCount(),
                analytics.totalRevenue(),
                analytics.lastSaleDate(),
                analytics.recentSalesCount(),
                analytics.recentRevenue(),
                analytics.yearlySalesCount(),
                analytics.yearlySalesRevenue(),

                categoryDistribution,
                topProductsUsage
        );
    }

    //Product

    public Product mapProductInsertToModel(ProductInsertDTO dto) {
        return Product.builder()
                .name(dto.name())
                .code(dto.code())
                .finalSellingPriceRetail(dto.finalSellingPriceRetail())
                .finalSellingPriceWholesale(dto.finalSellingPriceWholesale())
                .minutesToMake(dto.minutesToMake())
                .stock(dto.stock())
                .lowStockAlert(dto.lowStockAlert())
                .isActive(true)
                .build();
    }

    public Product mapProductUpdateToModel(ProductUpdateDTO dto, Product existingProduct) {
        existingProduct.setName(dto.name());
        existingProduct.setCode(dto.code());
        existingProduct.setFinalSellingPriceRetail(dto.finalSellingPriceRetail());
        existingProduct.setFinalSellingPriceWholesale(dto.finalSellingPriceWholesale());
        existingProduct.setMinutesToMake(dto.minutesToMake());
        existingProduct.setStock(dto.stock());
        existingProduct.setLowStockAlert(dto.lowStockAlert());
        return existingProduct;
    }

    public ProductListItemDTO mapToProductListItemDTO(Product product, ProductCostDataDTO data) {

        return new ProductListItemDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory() != null ? product.getCategory().getName() : "No Category",
                product.getMinutesToMake(),
                data.totalCost(),
                product.getSuggestedRetailSellingPrice(),
                product.getFinalSellingPriceRetail(),
                data.percentageDifference(),
                product.getIsActive(),
                data.isLowStock(),
                product.getStock(),
                product.getLowStockAlert()
        );
    }

    //Purchase

    public PurchaseReadOnlyDTO mapToPurchaseReadOnlyDTO(Purchase purchase) {

        List<PurchaseMaterialDTO> materials = purchase.getAllPurchaseMaterials().stream()
                .map(pm -> new PurchaseMaterialDTO(
                        pm.getMaterial().getId(),
                        pm.getMaterial().getName(),
                        pm.getQuantity(),
                        pm.getMaterial().getUnitOfMeasure(),
                        pm.getPriceAtTheTime(),
                        pm.getQuantity().multiply(pm.getPriceAtTheTime())
                ))
                .collect(Collectors.toList());

        return new PurchaseReadOnlyDTO(
                purchase.getId(),
                purchase.getSupplier().getName(),
                purchase.getPurchaseDate(),
                purchase.getTotalCost(),
                purchase.getAllPurchaseMaterials().size(),
                materials,
                purchase.getCreatedAt(),
                purchase.getUpdatedAt(),
                purchase.getCreatedBy().getUsername(),
                purchase.getLastUpdatedBy().getUsername()
        );
    }

    public PurchaseDetailedViewDTO mapToPurchaseDetailedViewDTO(Purchase purchase){

        List<PurchaseMaterialDetailDTO> materials = purchase.getAllPurchaseMaterials().stream()
                .map(pm -> {
                    BigDecimal lineTotal = pm.getQuantity().multiply(pm.getPriceAtTheTime());
                    BigDecimal costDifference = pm.getPriceAtTheTime().subtract(
                            pm.getMaterial().getCurrentUnitCost() != null ?
                                    pm.getMaterial().getCurrentUnitCost() : BigDecimal.ZERO);

                    return new PurchaseMaterialDetailDTO(
                            pm.getMaterial().getId(),
                            pm.getMaterial().getName(),
                            pm.getMaterial().getUnitOfMeasure(),
                            pm.getQuantity(),
                            pm.getPriceAtTheTime(),
                            pm.getMaterial().getCurrentUnitCost(),
                            lineTotal,
                            costDifference
                    );
                })
                .collect(Collectors.toList());

        BigDecimal totalItemCount = purchase.getAllPurchaseMaterials().stream()
                .map(PurchaseMaterial::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PurchaseDetailedViewDTO(
                purchase.getId(),
                purchase.getPurchaseDate(),
                purchase.getSupplier().getName(),
                purchase.getSupplier().getTin(),
                purchase.getSupplier().getPhoneNumber(),
                purchase.getSupplier().getEmail(),
                purchase.getTotalCost(),
                totalItemCount.intValue(),
                materials,
                purchase.getCreatedAt(),
                purchase.getCreatedBy().getUsername()
        );
    }

    //Sale

    public SaleReadOnlyDTO mapToSaleReadOnlyDTO(Sale sale){

        BigDecimal discountAmount = sale.getSuggestedTotalPrice().subtract(sale.getFinalTotalPrice());

        List<SaleProductDTO> products = new ArrayList<>();

        for(SaleProduct sp : sale.getAllSaleProducts()){
            SaleProductDTO dto = new SaleProductDTO(
                    sp.getProduct().getId(),
                    sp.getProduct().getName(),
                    sp.getProduct().getCode(),
                    sp.getQuantity(),
                    sp.getSuggestedPriceAtTheTime(),
                    sp.getPriceAtTheTime(),
                    sp.getQuantity().multiply(sp.getSuggestedPriceAtTheTime()),
                    sp.getQuantity().multiply(sp.getPriceAtTheTime()),
                    sp.getSale().getDiscountPercentage()
            );
            products.add(dto);
        }

        return new SaleReadOnlyDTO(
                sale.getId(),
                sale.getCustomer() != null ? sale.getCustomer().getFullName() : "Περαστικός",
                sale.getLocation().getName(),
                sale.getSaleDate(),
                sale.getIsWholesale(),
                sale.getSuggestedTotalPrice(),
                sale.getFinalTotalPrice(),
                sale.getDiscountPercentage(),
                discountAmount,
                sale.getPackagingPrice(),
                sale.getSuggestedTotalPrice().subtract(sale.getPackagingPrice()),
                sale.getPaymentMethod(),
                sale.getAllSaleProducts().size(),
                products,
                sale.getCreatedAt(),
                sale.getUpdatedAt(),
                sale.getCreatedBy().getUsername(),
                sale.getLastUpdatedBy().getUsername()
        );
    }

    public SaleItemDetailsDTO mapToSaleItemDetailsDTO(SaleProduct saleProduct){
        Product product = saleProduct.getProduct();

        // Calculate original price (retail or wholesale based on sale context)
        BigDecimal originalPrice = product.getFinalSellingPriceRetail();
        BigDecimal lineTotal = saleProduct.getPriceAtTheTime().multiply(saleProduct.getQuantity());
        BigDecimal lineDiscount = originalPrice.subtract(saleProduct.getPriceAtTheTime())
                .multiply(saleProduct.getQuantity());

        return new SaleItemDetailsDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory().getName(),
                saleProduct.getQuantity(),
                saleProduct.getPriceAtTheTime(),
                originalPrice,
                lineTotal,
                lineDiscount
        );
    }

    public SaleDetailedViewDTO mapToSaleDetailedViewDTO(Sale sale){
        BigDecimal totalItemCount = sale.getAllSaleProducts().stream()
                .map(SaleProduct::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageItemPrice = totalItemCount.compareTo(BigDecimal.ZERO) > 0 ?
                sale.getFinalTotalPrice().divide(totalItemCount, 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return new SaleDetailedViewDTO(
                sale.getId(),
                sale.getSaleDate(),
                sale.getCustomer() != null ?
                        new CustomerSearchResultDTO(
                                sale.getCustomer().getId(),
                                sale.getCustomer().getFullName(),
                                sale.getCustomer().getEmail()
                        ) : null,
                new LocationForDropdownDTO(
                        sale.getLocation().getId(),
                        sale.getLocation().getName()
                ),
                sale.getPaymentMethod(),
                sale.getSuggestedTotalPrice().subtract(sale.getPackagingPrice()), //subtotal
                sale.getPackagingPrice(),
                sale.getSuggestedTotalPrice(),
                sale.getFinalTotalPrice(),
                sale.getSuggestedTotalPrice().subtract(sale.getFinalTotalPrice()),
                sale.getDiscountPercentage(),

                sale.getAllSaleProducts().stream()
                        .map(this::mapToSaleItemDetailsDTO)
                        .collect(Collectors.toList()),
                sale.getIsWholesale(),
                totalItemCount.intValue(),
                averageItemPrice

        );
    }

    //Stock

    public StockManagementDTO mapToStockManagementDTO(Product product) {
        BigDecimal unitPrice = product.getFinalSellingPriceRetail();
        BigDecimal totalValue = BigDecimal.ZERO;

        if (product.getStock() != null && product.getStock() > 0 && unitPrice != null) {
            totalValue = unitPrice.multiply(BigDecimal.valueOf(product.getStock()));
        }

        return new StockManagementDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory() != null ? product.getCategory().getName() : "No Category",
                product.getStock(),
                product.getLowStockAlert(),
                product.getIsActive(),
                unitPrice,
                totalValue,
                calculateStockStatus(product)
        );
    }

    public StockAlertDTO mapToStockAlertDto(Product product){
        return new StockAlertDTO(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getStock(),
                product.getLowStockAlert(),
                calculateStockStatus(product)
        );
    }

    private StockStatus calculateStockStatus(Product product) {
        if (product.getStock() < 0) return StockStatus.NEGATIVE;
        if (product.getStock() <= product.getLowStockAlert()) return StockStatus.LOW;
        return StockStatus.NORMAL;
    }

    // Supplier

    public Supplier mapSupplierInsertToModel(SupplierInsertDTO dto){
        return Supplier.builder()
                .name(dto.name())
                .address(normalizeOptionalStringField(dto.address()))
                .tin(dto.tin())
                .phoneNumber(normalizeOptionalStringField(dto.phoneNumber()))
                .email(normalizeOptionalStringField(dto.email()))
                .isActive(true)
                .build();
    }

    public Supplier mapSupplierUpdateToModel(SupplierUpdateDTO dto, Supplier existingSupplier){
        existingSupplier.setName(dto.name());
        existingSupplier.setAddress(dto.address());
        existingSupplier.setTin(dto.tin());
        existingSupplier.setPhoneNumber(dto.phoneNumber());
        existingSupplier.setEmail(dto.email());
        return existingSupplier;
    }

    public SupplierReadOnlyDTO mapToSupplierReadOnlyDTO(Supplier supplier){
        return new SupplierReadOnlyDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getTin(),
                supplier.getPhoneNumber(),
                supplier.getEmail(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt(),
                supplier.getCreatedBy().getUsername(),
                supplier.getLastUpdatedBy().getUsername(),
                supplier.getIsActive(),
                supplier.getDeletedAt()
        );
    }

    public SupplierDetailedViewDTO mapToSupplierDetailedView(Supplier supplier, SupplierAnalyticsDTO analytics, List<MaterialStatsSummaryDTO> topMaterials){
        return new SupplierDetailedViewDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getTin(),
                supplier.getPhoneNumber(),
                supplier.getEmail(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt(),
                supplier.getCreatedBy() != null ? supplier.getCreatedBy().getUsername() : "system",
                supplier.getLastUpdatedBy() != null ? supplier.getLastUpdatedBy().getUsername() : "system",
                supplier.getIsActive(),
                supplier.getDeletedAt(),
                analytics.totalPurchases(),
                analytics.totalCostPaid() != null ? analytics.totalCostPaid() : BigDecimal.ZERO,
                analytics.lastPurchaseDate(),
                analytics.averagePurchaseValue(),
                topMaterials
        );
    }

    //Task

    public ToDoTaskReadOnlyDTO mapToToDoTaskReadOnlyDTO(ToDoTask task){
        LocalDate today = LocalDate.now();
        String statusLabel = determineTaskStatusLabel(task, today);
        Integer daysFromToday = calculateDaysFromToday(task.getDate(), today);

        return new ToDoTaskReadOnlyDTO(
                task.getId(),
                task.getDescription(),
                task.getDate(),
                task.getDateCompleted(),
                task.getStatus().toString(),
                statusLabel,
                daysFromToday
        );
    }

    private String determineTaskStatusLabel(ToDoTask task, LocalDate today) {
        if (task.getStatus() == TaskStatus.COMPLETED) {
            return "COMPLETED";
        }
        // For PENDING tasks, determine based on date
        if (task.getDate().isBefore(today)) {
            return "OVERDUE";
        } else if (task.getDate().isEqual(today)) {
            return "TODAY";
        } else {
            LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (task.getDate().isAfter(today) && task.getDate().isBefore(endOfWeek.plusDays(1))) {
                return "THIS_WEEK";
            } else {
                return "FUTURE";
            }
        }
    }

    private Integer calculateDaysFromToday(LocalDate taskDate, LocalDate today) {
        return (int) ChronoUnit.DAYS.between(today, taskDate);
    }




    //User


    public User mapUserInsertToModel(UserInsertDTO dto){
        return User.builder()
                .username(dto.username())
                .password(dto.password())
                .role(Role.USER)
                .isActive(true)
                .build();
    }

    public User mapUserUpdateToModel(UserUpdateDTO dto, User existingUser){
        existingUser.setUsername(dto.username());
        // Add other fields if needed for updates
        return existingUser;
    }

    public UserReadOnlyDTO mapToUserReadOnlyDTO(User user){
        return new UserReadOnlyDTO(
                user.getId(),
                user.getUsername(),
                user.getRole().toString(),
                user.getIsActive(),
                user.getDeletedAt(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getCreatedBy() == null ? "system" : user.getCreatedBy().getUsername(),
                user.getLastUpdatedBy() == null ? "system" : user.getLastUpdatedBy().getUsername()
        );
    }

    private String normalizeOptionalStringField(String value) {
        return value != null && value.trim().isEmpty() ? null : value;
    }
}
