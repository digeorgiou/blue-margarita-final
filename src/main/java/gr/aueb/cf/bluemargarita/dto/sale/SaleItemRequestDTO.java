package gr.aueb.cf.bluemargarita.dto.sale;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * DTO for individual sale items in the request
 */
public record SaleItemRequestDTO(

        @NotNull(message = "το id του προϊοντος είναι απαραίτητο")
        Long productId,

        @NotNull(message = "Παρακαλώ εισάγετε ποσότητα")
        @DecimalMin(value = "0.01", message = "Η ποσότητα πρέπει να είναι θετικός αριθμός")
        BigDecimal quantity
) {}
