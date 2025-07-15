package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>,
        JpaSpecificationExecutor<Sale> {

    /**
     * we use database aggregation to avoid loading large datasets into memory
     */

// Basic counting - already exists, just ensuring it's here
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.location.id = :locationId")
    Integer countByLocationId(@Param("locationId") Long locationId);

    // Total revenue calculation
    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.location.id = :locationId")
    BigDecimal sumRevenueByLocationId(@Param("locationId") Long locationId);

    // Date range queries
    @Query("SELECT MIN(s.saleDate) FROM Sale s WHERE s.location.id = :locationId")
    LocalDate findFirstSaleDateByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT MAX(s.saleDate) FROM Sale s WHERE s.location.id = :locationId")
    LocalDate findLastSaleDateByLocationId(@Param("locationId") Long locationId);

    // Recent performance (last 30 days)
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    Integer countByLocationIdAndDateRange(
            @Param("locationId") Long locationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(s.finalTotalPrice), 0) FROM Sale s WHERE s.location.id = :locationId AND s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByLocationIdAndDateRange(
            @Param("locationId") Long locationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}
