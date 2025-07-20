package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.SaleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleProductRepository extends JpaRepository<SaleProduct, Long>,
        JpaSpecificationExecutor<SaleProduct> {

    // =============================================================================
    // PRODUCT QUERIES
    // =============================================================================

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.id = :productId")
    Integer countSalesByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp WHERE sp.product.id = :productId")
    BigDecimal sumQuantityByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.id = :productId")
    BigDecimal sumRevenueByProductId(@Param("productId") Long productId);

    @Query("SELECT MAX(s.saleDate) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId")
    LocalDate findLastSaleDateByProductId(@Param("productId") Long productId);

    // =============================================================================
    // PRODUCT + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdAndDateRange(@Param("productId") Long productId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByProductIdAndDateRange(@Param("productId") Long productId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdAndDateRange(@Param("productId") Long productId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(AVG(sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateAverageSellingPriceByProductIdAndDateRange(@Param("productId") Long productId,
                                                                   @Param("startDate") LocalDate startDate,
                                                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.saleDate BETWEEN :startDate AND :endDate AND sp.product.isActive = true")
    List<Long> findDistinctProductIdsByDateRange(@Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT s.location.id FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.saleDate BETWEEN :startDate AND :endDate")
    List<Long> findDistinctLocationIdsByProductIdAndDateRange(@Param("productId") Long productId,
                                                              @Param("startDate") LocalDate startDate,
                                                              @Param("endDate") LocalDate endDate);

    // =============================================================================
    // PRODUCT + LOCATION
    // =============================================================================

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId")
    BigDecimal sumQuantityByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId")
    BigDecimal sumRevenueByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    @Query("SELECT MAX(s.saleDate) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId")
    LocalDate findLastSaleDateByProductIdAndLocationId(@Param("productId") Long productId, @Param("locationId") Long locationId);

    // =============================================================================
    // PRODUCT + CUSTOMER
    // =============================================================================

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId")
    BigDecimal sumQuantityByProductIdAndCustomerId(@Param("productId") Long productId, @Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId")
    BigDecimal sumRevenueByProductIdAndCustomerId(@Param("productId") Long productId, @Param("customerId") Long customerId);

    @Query("SELECT MAX(s.saleDate) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId")
    LocalDate findLastSaleDateByProductIdAndCustomerId(@Param("productId") Long productId, @Param("customerId") Long customerId);


    // =============================================================================
    // CATEGORY QUERIES
    // =============================================================================

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    Integer countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    BigDecimal sumRevenueByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT MAX(sp.sale.saleDate) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId")
    LocalDate findLastSaleDateByCategoryId(@Param("categoryId") Long categoryId);

    // =============================================================================
    // CATEGORY  + DATE RANGE
    // =============================================================================

    @Query("SELECT COUNT(sp) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    Integer countByCategoryIdAndDateRange(@Param("categoryId") Long categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp WHERE sp.product.category.id = :categoryId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByCategoryIdAndDateRange(@Param("categoryId") Long categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


    // =============================================================================
    // LOCATION QUERIES
    // =============================================================================

    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.location.id = :locationId")
    List<Long> findDistinctProductIdsByLocationId(@Param("locationId") Long locationId);

    // =============================================================================
    // LOCATION + DATE RANGE
    // =============================================================================


    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByProductIdLocationIdAndDateRange(@Param("productId") Long productId,
                                                            @Param("locationId") Long locationId,
                                                            @Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdLocationIdAndDateRange(@Param("productId") Long productId,
                                                           @Param("locationId") Long locationId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdLocationIdAndDateRange(@Param("productId") Long productId,
                                                        @Param("locationId") Long locationId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);




    // =============================================================================
    // MATERIAL QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId")
    Integer countSalesByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId")
    BigDecimal sumRevenueByMaterialId(@Param("materialId") Long materialId);

    @Query("SELECT MAX(sp.sale.saleDate) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId")
    LocalDate findLastSaleDateByMaterialId(@Param("materialId") Long materialId);

    // =============================================================================
    // MATERIAL + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByMaterialIdAndDateRange(@Param("materialId") Long materialId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productMaterials pm WHERE pm.material.id = :materialId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByMaterialIdAndDateRange(@Param("materialId") Long materialId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // =============================================================================
    // PROCEDURE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId")
    Integer countSalesByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId")
    BigDecimal sumRevenueByProcedureId(@Param("procedureId") Long procedureId);

    @Query("SELECT MAX(sp.sale.saleDate) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId")
    LocalDate findLastSaleDateByProcedureId(@Param("procedureId") Long procedureId);

    // =============================================================================
    // PROCEDURE + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProcedureIdAndDateRange(@Param("procedureId") Long procedureId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.product.productProcedures pp WHERE pp.procedure.id = :procedureId AND sp.sale.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProcedureIdAndDateRange(@Param("procedureId") Long procedureId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);


    // =============================================================================
    // CUSTOMER QUERIES
    // =============================================================================

    @Query("SELECT DISTINCT sp.product.id FROM SaleProduct sp JOIN sp.sale s WHERE s.customer.id = :customerId")
    List<Long> findDistinctProductIdsByCustomerId(@Param("customerId") Long customerId);

    // =============================================================================
    // CUSTOMER + DATE RANGE QUERIES
    // =============================================================================

    @Query("SELECT DISTINCT s.customer.id FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer IS NOT NULL AND s.saleDate BETWEEN :startDate AND :endDate")
    List<Long> findDistinctCustomerIdsByProductIdAndDateRange(@Param("productId") Long productId,
                                                              @Param("startDate") LocalDate startDate,
                                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumQuantityByProductIdCustomerIdAndDateRange(@Param("productId") Long productId,
                                                            @Param("customerId") Long customerId,
                                                            @Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(sp.quantity * sp.priceAtTheTime), 0) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByProductIdCustomerIdAndDateRange(@Param("productId") Long productId,
                                                           @Param("customerId") Long customerId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT sp.sale.id) FROM SaleProduct sp JOIN sp.sale s WHERE sp.product.id = :productId AND s.customer.id = :customerId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countSalesByProductIdCustomerIdAndDateRange(@Param("productId") Long productId,
                                                        @Param("customerId") Long customerId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

}
