package gr.aueb.cf.bluemargarita.mapper;

import gr.aueb.cf.bluemargarita.core.enums.Role;
import gr.aueb.cf.bluemargarita.dto.category.CategoryInsertDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerInsertDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerWithSalesDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationInsertDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialInsertDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureInsertDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierInsertDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
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

    public CustomerReadOnlyDTO mapToCustomerReadOnlyDTO(Customer customer){
        return new CustomerReadOnlyDTO(
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
                customer.getFirstSaleDate()
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

    public ProductListItemDTO mapToProductListItemDTO(Product product) {
        BigDecimal totalCost = calculateTotalCost(product);
        BigDecimal percentageDiff = calculatePercentageDifference(
                product.getFinalSellingPriceRetail(),
                product.getSuggestedRetailSellingPrice()
        );

        return new ProductListItemDTO(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getCategory() != null ? product.getCategory().getName() : "No Category",
                product.getMinutesToMake(),
                totalCost,
                product.getSuggestedRetailSellingPrice(),
                product.getFinalSellingPriceRetail(),
                percentageDiff,
                product.getIsActive(),
                product.getStock() != null && product.getLowStockAlert() != null &&
                        product.getStock() <= product.getLowStockAlert(),
                product.getStock()
        );
    }

    // Helper methods for product calculations
    private BigDecimal calculateTotalCost(Product product) {
        BigDecimal materialCost = calculateMaterialCost(product);
        BigDecimal laborCost = calculateLaborCost(product);
        return materialCost.add(laborCost);
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

        // Convert minutes to hours and multiply by hourly rate
        BigDecimal hoursToMake = BigDecimal.valueOf(product.getMinutesToMake())
                .divide(BigDecimal.valueOf(60.0), 4, RoundingMode.HALF_UP);

        return hoursToMake.multiply(BigDecimal.valueOf(7.0)); // HOURLY_LABOR_RATE
    }

    private BigDecimal calculatePercentageDifference(BigDecimal current, BigDecimal suggested) {
        if (current == null || current.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (suggested == null || suggested.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(suggested)
                .divide(suggested, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
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

    //User

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
