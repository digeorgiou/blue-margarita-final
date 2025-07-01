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
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierInsertDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

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
                customer.getDeletedAt()
        );
    }

    public CustomerWithSalesDTO mapToCustomerWithSalesDTO(Customer customer) {
        // Calculate sales statistics
        int totalOrders =  customer.getAllSales().size();

        BigDecimal totalOrderValue = customer.getAllSales().stream()
                .map(Sale::getFinalPrice)
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
                .description(dto.description())
                .currentUnitCost(dto.currentUnitCost())
                .unitOfMeasure(dto.unitOfMeasure())
                .isActive(true)
                .build();
    }

    public Material mapMaterialUpdateToModel(MaterialUpdateDTO dto, Material existingMaterial){
        existingMaterial.setDescription(dto.description());
        existingMaterial.setCurrentUnitCost(dto.currentUnitCost());
        existingMaterial.setUnitOfMeasure(dto.unitOfMeasure());
        return existingMaterial;
    }

    public MaterialReadOnlyDTO mapToMaterialReadOnlyDTO(Material material){
        return new MaterialReadOnlyDTO(
                material.getId(),
                material.getDescription(),
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
                .description(dto.description())
                .isActive(true)
                .build();
    }

    public Procedure mapProcedureUpdateToModel(ProcedureUpdateDTO dto, Procedure existingProcedure){
        existingProcedure.setDescription(dto.description());
        return existingProcedure;
    }

    public ProcedureReadOnlyDTO mapToProcedureReadOnlyDTO(Procedure procedure){
        return new ProcedureReadOnlyDTO(
                procedure.getId(),
                procedure.getDescription(),
                procedure.getCreatedAt(),
                procedure.getUpdatedAt(),
                procedure.getCreatedBy().getUsername(),
                procedure.getLastUpdatedBy().getUsername(),
                procedure.getIsActive(),
                procedure.getDeletedAt()
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
