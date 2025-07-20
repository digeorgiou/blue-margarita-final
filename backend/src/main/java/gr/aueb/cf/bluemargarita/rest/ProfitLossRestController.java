package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.filters.ProfitLossFilters;
import gr.aueb.cf.bluemargarita.dto.analytics.ProfitLossReportDTO;
import gr.aueb.cf.bluemargarita.service.IProfitLossService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profit-loss")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Profit & Loss Reports", description = "APIs for generating profit and loss reports, revenue analysis, and financial performance metrics")
public class ProfitLossRestController {

    private final IProfitLossService profitLossService;

    // =============================================================================
    // PAGE INITIALIZATION - LOAD DEFAULT REPORTS
    // =============================================================================

    @Operation(
            summary = "Get Profit & Loss page initialization data",
            description = "Retrieves default profit and loss reports for common time periods: current month, last month, current year, and last year. Provides quick overview for page load.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete Profit & Loss page initialization with default reports",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/init")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getProfitLossPageData() {
        Map<String, Object> pageData = new HashMap<>();

        LocalDate today = LocalDate.now();

        // Current month report
        LocalDate currentMonthStart = today.withDayOfMonth(1);
        LocalDate currentMonthEnd = today.withDayOfMonth(today.lengthOfMonth());
        ProfitLossFilters currentMonthFilters = ProfitLossFilters.builder()
                .dateFrom(currentMonthStart)
                .dateTo(currentMonthEnd)
                .build();
        pageData.put("currentMonthReport", profitLossService.generateProfitLossReport(currentMonthFilters));

        // Last month report
        LocalDate lastMonthStart = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = today.minusMonths(1).withDayOfMonth(today.minusMonths(1).lengthOfMonth());
        ProfitLossFilters lastMonthFilters = ProfitLossFilters.builder()
                .dateFrom(lastMonthStart)
                .dateTo(lastMonthEnd)
                .build();
        pageData.put("lastMonthReport", profitLossService.generateProfitLossReport(lastMonthFilters));

        // Current year report
        LocalDate yearStart = today.withDayOfYear(1);
        ProfitLossFilters yearFilters = ProfitLossFilters.builder()
                .dateFrom(yearStart)
                .dateTo(today)
                .build();
        pageData.put("currentYearReport", profitLossService.generateProfitLossReport(yearFilters));

        return new ResponseEntity<>(pageData, HttpStatus.OK);
    }

    // =============================================================================
    // CUSTOM PROFIT & LOSS REPORTS
    // =============================================================================

    @Operation(
            summary = "Generate custom Profit & Loss report",
            description = "Generates a comprehensive profit and loss report for the specified date range. Includes total revenue, total expenses, net profit, profit margin, and detailed expense breakdown by type.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete profit and loss report with financial metrics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProfitLossReportDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid date range",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProfitLossReportDTO> generateProfitLossReport(
            @Parameter(description = "Start date for the report (inclusive)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @Parameter(description = "End date for the report (inclusive)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

        // Validate date range
        if (dateFrom.isAfter(dateTo)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        ProfitLossFilters filters = ProfitLossFilters.builder()
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .build();

        ProfitLossReportDTO report = profitLossService.generateProfitLossReport(filters);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    // =============================================================================
    // QUICK PERIOD REPORTS
    // =============================================================================

    @Operation(
            summary = "Get current month Profit & Loss report",
            description = "Generates profit and loss report for the current month. Quick access endpoint for current month performance.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Current month profit and loss report",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProfitLossReportDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/current-month")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProfitLossReportDTO> getCurrentMonthReport() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());

        ProfitLossFilters filters = ProfitLossFilters.builder()
                .dateFrom(monthStart)
                .dateTo(monthEnd)
                .build();

        ProfitLossReportDTO report = profitLossService.generateProfitLossReport(filters);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    @Operation(
            summary = "Get last month Profit & Loss report",
            description = "Generates profit and loss report for the previous month. Quick access endpoint for last month performance comparison.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Last month profit and loss report",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProfitLossReportDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/last-month")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProfitLossReportDTO> getLastMonthReport() {
        LocalDate today = LocalDate.now();
        LocalDate lastMonthStart = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = today.minusMonths(1).withDayOfMonth(today.minusMonths(1).lengthOfMonth());

        ProfitLossFilters filters = ProfitLossFilters.builder()
                .dateFrom(lastMonthStart)
                .dateTo(lastMonthEnd)
                .build();

        ProfitLossReportDTO report = profitLossService.generateProfitLossReport(filters);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    @Operation(
            summary = "Get current year Profit & Loss report",
            description = "Generates profit and loss report for the current year (January 1st to current date). Quick access endpoint for year-to-date performance.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Current year profit and loss report",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProfitLossReportDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/current-year")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProfitLossReportDTO> getCurrentYearReport() {
        LocalDate today = LocalDate.now();
        LocalDate yearStart = today.withDayOfYear(1);

        ProfitLossFilters filters = ProfitLossFilters.builder()
                .dateFrom(yearStart)
                .dateTo(today)
                .build();

        ProfitLossReportDTO report = profitLossService.generateProfitLossReport(filters);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    @Operation(
            summary = "Get last year Profit & Loss report",
            description = "Generates profit and loss report for the complete previous year. Quick access endpoint for full year performance comparison.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Last year profit and loss report",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProfitLossReportDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/last-year")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProfitLossReportDTO> getLastYearReport() {
        LocalDate today = LocalDate.now();
        LocalDate lastYearStart = today.minusYears(1).withDayOfYear(1);
        LocalDate lastYearEnd = today.minusYears(1).withDayOfYear(today.minusYears(1).lengthOfYear());

        ProfitLossFilters filters = ProfitLossFilters.builder()
                .dateFrom(lastYearStart)
                .dateTo(lastYearEnd)
                .build();

        ProfitLossReportDTO report = profitLossService.generateProfitLossReport(filters);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    // =============================================================================
    // COMPARATIVE REPORTS
    // =============================================================================

    @Operation(
            summary = "Get month-over-month comparison",
            description = "Compares current month performance with the previous month. Returns both reports for easy comparison of key metrics.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Month-over-month comparison data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/comparison/month-over-month")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMonthOverMonthComparison() {
        Map<String, Object> comparison = new HashMap<>();

        LocalDate today = LocalDate.now();

        // Current month
        LocalDate currentMonthStart = today.withDayOfMonth(1);
        LocalDate currentMonthEnd = today.withDayOfMonth(today.lengthOfMonth());
        ProfitLossFilters currentFilters = ProfitLossFilters.builder()
                .dateFrom(currentMonthStart)
                .dateTo(currentMonthEnd)
                .build();

        // Last month
        LocalDate lastMonthStart = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthEnd = today.minusMonths(1).withDayOfMonth(today.minusMonths(1).lengthOfMonth());
        ProfitLossFilters lastFilters = ProfitLossFilters.builder()
                .dateFrom(lastMonthStart)
                .dateTo(lastMonthEnd)
                .build();

        comparison.put("currentMonth", profitLossService.generateProfitLossReport(currentFilters));
        comparison.put("previousMonth", profitLossService.generateProfitLossReport(lastFilters));

        return new ResponseEntity<>(comparison, HttpStatus.OK);
    }

    @Operation(
            summary = "Get year-over-year comparison",
            description = "Compares current year performance with the previous year. Returns both reports for easy comparison of annual performance.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Year-over-year comparison data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/comparison/year-over-year")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getYearOverYearComparison() {
        Map<String, Object> comparison = new HashMap<>();

        LocalDate today = LocalDate.now();

        // Current year
        LocalDate currentYearStart = today.withDayOfYear(1);
        ProfitLossFilters currentFilters = ProfitLossFilters.builder()
                .dateFrom(currentYearStart)
                .dateTo(today)
                .build();

        // Last year (full year)
        LocalDate lastYearStart = today.minusYears(1).withDayOfYear(1);
        LocalDate lastYearEnd = today.minusYears(1).withDayOfYear(today.minusYears(1).lengthOfYear());
        ProfitLossFilters lastFilters = ProfitLossFilters.builder()
                .dateFrom(lastYearStart)
                .dateTo(lastYearEnd)
                .build();

        comparison.put("currentYear", profitLossService.generateProfitLossReport(currentFilters));
        comparison.put("previousYear", profitLossService.generateProfitLossReport(lastFilters));

        return new ResponseEntity<>(comparison, HttpStatus.OK);
    }
}