package gr.aueb.cf.bluemargarita.mapper;

import gr.aueb.cf.bluemargarita.core.enums.Role;
import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import gr.aueb.cf.bluemargarita.dto.category.CategoryInsertDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.customer.*;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.expense.ExpenseReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationInsertDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialInsertDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureInsertDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseMaterialDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseMaterialDetailDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleItemDetailsDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleProductDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockManagementDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.*;
import gr.aueb.cf.bluemargarita.dto.task.ToDoTaskReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.model.*;
import org.springframework.scheduling.config.Task;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    // Customer

    public Customer mapCustomerInsertToModel(CustomerInsertDTO dto){
        return Customer.builder()
                .firstname(dto.firstname())
                .lastname(dto.lastname())
                .gender(dto.gender())
                .phoneNumber(dto.phoneNumber())
                .address(dto.address())
                .email(dto.email())
                .tin(dto.tin())
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
                customer.getTin()
        );
    }

    public CustomerDetailedViewDTO mapToCustomerDetailedViewDTO(Customer customer, CustomerSalesDataDTO data, List<ProductStatsSummaryDTO> topProducts){

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
                data.totalRevenue(),
                data.numberOfSales(),
                data.lastOrderDate(),
                topProducts
        );
    }

    public CustomerWithSalesDTO mapToCustomerWithSalesDTO(Customer customer) {
        // Calculate sales statistics
        int totalOrders =  customer.getAllSales().size();

        BigDecimal totalOrderValue = customer.getAllSales().stream()
                .map(Sale::getFinalTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate lastOrderDate = customer.getAllSales().stream()
                .map(Sale::getSaleDate)
                .filter(date -> date != null)
                .max(LocalDate::compareTo)
                .orElse(null);

        BigDecimal averageOrderValue = totalOrders > 0 && totalOrderValue.compareTo(BigDecimal.ZERO) > 0
                ? totalOrderValue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        return new CustomerWithSalesDTO(
                customer.getId(),
                customer.getFirstname(),
                customer.getLastname(),
                customer.getFullName(),
                customer.getGender(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getEmail(),
                customer.getTin(),
                customer.getIsActive(),
                customer.getCreatedAt(),
                customer.getUpdatedAt(),
                customer.getCreatedBy() != null ? customer.getCreatedBy().getUsername() : null,
                customer.getLastUpdatedBy() != null ? customer.getLastUpdatedBy().getUsername() : null,
                totalOrders,
                totalOrderValue,
                lastOrderDate,
                averageOrderValue
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

    public StockManagementDTO mapToStockManagementDTO(Product product) {
        Integer currentStock = product.getStock() != null ? product.getStock() : 0;
        Integer lowStockAlert = product.getLowStockAlert();

        // Calculate stock metrics
        Integer stockDifference = null;
        Double stockPercentage = null;
        StockManagementDTO.StockStatus status;

        if (lowStockAlert != null && lowStockAlert > 0) {
            stockDifference = currentStock - lowStockAlert;
            stockPercentage = (double) currentStock / lowStockAlert * 100;

            if (currentStock < 0) {
                status = StockManagementDTO.StockStatus.NEGATIVE;
            } else if (currentStock <= lowStockAlert) {
                status = StockManagementDTO.StockStatus.LOW;
            } else {
                status = StockManagementDTO.StockStatus.NORMAL;
            }
        } else {
            // No alert threshold set
            if (currentStock < 0) {
                status = StockManagementDTO.StockStatus.NEGATIVE;
            } else {
                status = StockManagementDTO.StockStatus.NO_ALERT;
            }
        }

        return new StockManagementDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory() != null ? product.getCategory().getName() : "No Category",
                currentStock,
                lowStockAlert,
                product.getIsActive(),
                stockDifference,
                stockPercentage,
                status
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

    //Sale

    public SaleReadOnlyDTO mapToSaleReadOnlyDTO(Sale sale){

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
                sale.getCustomer().getFullName(),
                sale.getLocation().getName(),
                sale.getSaleDate(),
                sale.getSuggestedTotalPrice(),
                sale.getFinalTotalPrice(),
                sale.getDiscountPercentage(),
                sale.getDiscountPercentage(),
                sale.getPackagingPrice(),
                sale.getFinalTotalPrice().add(sale.getPackagingPrice()),
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


    // Supplier

    public Supplier mapSupplierInsertToModel(SupplierInsertDTO dto){
        return Supplier.builder()
                .name(dto.name())
                .address(dto.address())
                .tin(dto.tin())
                .phoneNumber(dto.phoneNumber())
                .email(dto.email())
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

    public SupplierListItemDTO mapToSupplierListItemDTO(Supplier supplier) {
        // Calculate purchase statistics - this would be more efficient with repository aggregation
        int totalPurchases = supplier.getAllPurchases().size();

        BigDecimal totalCostPaid = supplier.getAllPurchases().stream()
                .map(Purchase::getTotalCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate lastPurchaseDate = supplier.getAllPurchases().stream()
                .map(Purchase::getPurchaseDate)
                .filter(date -> date != null)
                .max(LocalDate::compareTo)
                .orElse(null);

        return new SupplierListItemDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getAddress(),
                supplier.getTin(),
                supplier.getPhoneNumber(),
                supplier.getEmail(),
                supplier.getIsActive(),
                totalPurchases,
                totalCostPaid,
                lastPurchaseDate
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

        if (task.getStatus() ==TaskStatus.CANCELLED) {
            return "CANCELLED";
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


}
