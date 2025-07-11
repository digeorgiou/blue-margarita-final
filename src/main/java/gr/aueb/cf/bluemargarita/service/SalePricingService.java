package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.model.Product;
import gr.aueb.cf.bluemargarita.model.Sale;
import gr.aueb.cf.bluemargarita.model.SaleProduct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Component
public class SalePricingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SalePricingService.class);

    /**
     * Calculate suggested total price from existing sale products
     * This works with your Sale.getAllSaleProducts() method
     */
    public BigDecimal calculateSuggestedTotalFromSale(Sale sale) {
        return sale.getAllSaleProducts().stream()
                .map(sp -> sp.getProduct().getFinalSellingPriceRetail().multiply(sp.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate discount percentage based on suggested vs final price
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
     * Calculate actual selling price for a product with discount applied
     */
    public BigDecimal calculateActualSellingPrice(Product product, BigDecimal discountPercentage) {
        if (discountPercentage == null || discountPercentage.compareTo(BigDecimal.ZERO) == 0) {
            return product.getFinalSellingPriceRetail();
        }

        BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                discountPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
        );

        return product.getFinalSellingPriceRetail().multiply(discountMultiplier);
    }

    /**
     * Calculate total revenue for a sale product
     */
    public BigDecimal calculateSaleProductRevenue(SaleProduct saleProduct) {
        return saleProduct.getQuantity().multiply(saleProduct.getPriceAtTheTime());
    }

    /**
     * Calculate suggested total for a sale product (before discount)
     */
    public BigDecimal calculateSaleProductSuggestedTotal(SaleProduct saleProduct) {
        if (saleProduct.getSuggestedPriceAtTheTime() != null) {
            return saleProduct.getQuantity().multiply(saleProduct.getSuggestedPriceAtTheTime());
        }
        // Fallback to product's current price if suggested price not stored
        return saleProduct.getQuantity().multiply(saleProduct.getProduct().getFinalSellingPriceRetail());
    }

    /**
     * Calculate discount amount for a specific sale product
     */
    public BigDecimal calculateSaleProductDiscountAmount(SaleProduct saleProduct) {
        BigDecimal suggestedTotal = calculateSaleProductSuggestedTotal(saleProduct);
        BigDecimal actualTotal = calculateSaleProductRevenue(saleProduct);
        return suggestedTotal.subtract(actualTotal);
    }
}
