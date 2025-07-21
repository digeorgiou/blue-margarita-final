package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.CartItemDTO;
import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.model.Sale;
import gr.aueb.cf.bluemargarita.model.SaleProduct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Service responsible for all pricing calculations related to sales.
 * Handles discount calculations, final pricing, and pricing validation.

 * This service is designed to be stateless and focused purely on pricing logic,
 * separating it from the main SaleService CRUD operations.
 */

@Service
@Component
public class SalePricingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SalePricingService.class);


    /**
     * Applies pricing calculations to a sale entity during creation
     * Calculates suggested total, discount percentage, and individual product prices
     *
     * @param sale Sale entity to apply pricing to
     * @param finalPrice Final price specified by user
     */
    public void applySalePricing(Sale sale, BigDecimal finalPrice) {

        // Calculate suggested total from all sale products
        BigDecimal suggestedTotal = calculateSuggestedTotalFromSale(sale);
        sale.setSuggestedTotalPrice(suggestedTotal);

        // Set the final total price
        sale.setFinalTotalPrice(finalPrice);

        // Calculate and set discount percentage
        BigDecimal discountPercentage = calculateDiscountPercentage(suggestedTotal, finalPrice);
        sale.setDiscountPercentage(discountPercentage);

        // Apply proportional discount to each sale product
        applyDiscountToSaleProducts(sale, discountPercentage);

        LOGGER.debug("Pricing applied - Suggested: {}, Final: {}, Discount: {}%",
                suggestedTotal, finalPrice, discountPercentage);
    }

    /**
     * Recalculates pricing for an existing sale during updates
     * Used when sale details are modified and pricing needs to be refreshed
     *
     * @param sale Sale entity to recalculate pricing for
     */
    public void recalculateSalePricing(Sale sale) {

        // Recalculate suggested total
        BigDecimal suggestedTotal = calculateSuggestedTotalFromSale(sale);
        sale.setSuggestedTotalPrice(suggestedTotal);

        // Recalculate discount percentage based on current final price
        BigDecimal discountPercentage = calculateDiscountPercentage(suggestedTotal, sale.getFinalTotalPrice());
        sale.setDiscountPercentage(discountPercentage);

        // Reapply discount to all sale products
        applyDiscountToSaleProducts(sale, discountPercentage);

        LOGGER.debug("Pricing recalculated - Suggested: {}, Final: {}, Discount: {}%",
                suggestedTotal, sale.getFinalTotalPrice(), discountPercentage);
    }


    // =============================================================================
    // CART PRICING METHODS - Called by SaleService for Record Sale Page
    // =============================================================================

    /**
     * Calculates complete pricing breakdown for shopping cart
     * Handles both discount percentage and final price input methods
     *
     * @param calculatedItems List of cart items with individual pricing
     * @param subtotal Subtotal before packaging and discounts
     * @param request Original pricing calculation request
     * @return Complete pricing breakdown response
     */
    public PriceCalculationResponseDTO calculatePricing(List<CartItemDTO> calculatedItems,
                                                        BigDecimal subtotal,
                                                        PriceCalculationRequestDTO request) {

        BigDecimal packagingCost = request.packagingCost() != null ? request.packagingCost() : BigDecimal.ZERO;
        BigDecimal suggestedTotal = subtotal.add(packagingCost);

        BigDecimal finalPrice;
        BigDecimal discountAmount;
        BigDecimal discountPercentage;

        // Handle both input scenarios
        if (request.userFinalPrice() != null) {
            // User entered final price - calculate discount
            finalPrice = request.userFinalPrice();
            discountAmount = suggestedTotal.subtract(finalPrice);
            discountPercentage = calculateDiscountPercentage(suggestedTotal, finalPrice);
        } else if (request.userDiscountPercentage() != null) {
            // User entered discount percentage - calculate final price
            discountPercentage = request.userDiscountPercentage();
            discountAmount = calculateDiscountAmount(suggestedTotal, discountPercentage);
            finalPrice = suggestedTotal.subtract(discountAmount);
        } else {
            // No discount applied
            finalPrice = suggestedTotal;
            discountAmount = BigDecimal.ZERO;
            discountPercentage = BigDecimal.ZERO;
        }

        LOGGER.debug("Cart pricing calculated - Suggested: {}, Final: {}, Discount: {}%, Amount: {}",
                suggestedTotal, finalPrice, discountPercentage, discountAmount);

        return new PriceCalculationResponseDTO(
                subtotal,
                packagingCost,
                suggestedTotal,
                finalPrice,
                discountAmount,
                discountPercentage,
                calculatedItems

        );
    }

    // =============================================================================
    // CORE PRICING CALCULATION METHODS
    // =============================================================================

    /**
     * Calculates suggested total price from all products in a sale
     * Uses the retail or wholesale price based on sale type
     *
     * @param sale Sale entity with products
     * @return Suggested total price including packaging
     */
    public BigDecimal calculateSuggestedTotalFromSale(Sale sale) {
        BigDecimal productTotal = sale.getAllSaleProducts().stream()
                .map(sp -> {
                    BigDecimal unitPrice = sale.getIsWholesale() ?
                            sp.getProduct().getFinalSellingPriceWholesale() :
                            sp.getProduct().getFinalSellingPriceRetail();
                    return unitPrice.multiply(sp.getQuantity());
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal packagingPrice = sale.getPackagingPrice() != null ?
                sale.getPackagingPrice() : BigDecimal.ZERO;

        return productTotal.add(packagingPrice);
    }


    /**
     * Calculates discount percentage based on suggested vs final price
     *
     * @param suggestedTotal Original suggested total
     * @param finalTotal Final price after discount
     * @return Discount percentage (0-100)
     */
    public BigDecimal calculateDiscountPercentage(BigDecimal suggestedTotal, BigDecimal finalTotal) {
        if (suggestedTotal == null || suggestedTotal.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = suggestedTotal.subtract(finalTotal);
        return discount.divide(suggestedTotal, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    /**
     * Calculates discount amount based on total and percentage
     *
     * @param total Total amount before discount
     * @param discountPercentage Discount percentage (0-100)
     * @return Discount amount
     */
    public BigDecimal calculateDiscountAmount(BigDecimal total, BigDecimal discountPercentage) {
        if (total == null || discountPercentage == null || discountPercentage.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return total.multiply(discountPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates actual selling price for a product with discount applied
     *
     * @param product Product entity
     * @param discountPercentage Discount percentage to apply
     * @param isWholesale Whether to use wholesale or retail pricing
     * @return Actual selling price after discount
     */
    public BigDecimal calculateActualSellingPrice(Product product, BigDecimal discountPercentage, boolean isWholesale) {
        BigDecimal basePrice = isWholesale ?
                product.getFinalSellingPriceWholesale() :
                product.getFinalSellingPriceRetail();

        if (discountPercentage == null || discountPercentage.compareTo(BigDecimal.ZERO) == 0) {
            return basePrice;
        }

        BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                discountPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
        );

        return basePrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    /**
     * Applies proportional discount to all products in a sale
     * Updates the priceAtTheTime field for each SaleProduct
     *
     * @param sale Sale entity with products
     * @param discountPercentage Overall discount percentage to apply
     */
    private void applyDiscountToSaleProducts(Sale sale, BigDecimal discountPercentage) {
        for (SaleProduct saleProduct : sale.getAllSaleProducts()) {
            BigDecimal suggestedPrice = sale.getIsWholesale() ?
                    saleProduct.getProduct().getFinalSellingPriceWholesale() :
                    saleProduct.getProduct().getFinalSellingPriceRetail();

            BigDecimal actualPrice = calculateActualSellingPrice(
                    saleProduct.getProduct(),
                    discountPercentage,
                    sale.getIsWholesale()
            );

            saleProduct.setSuggestedPriceAtTheTime(suggestedPrice);  // ADD THIS LINE
            saleProduct.setPriceAtTheTime(actualPrice);

            LOGGER.debug("Applied pricing to product {} - Suggested: {}, Actual: {}",
                    saleProduct.getProduct().getCode(),
                    suggestedPrice,
                    actualPrice);
        }
    }

}
