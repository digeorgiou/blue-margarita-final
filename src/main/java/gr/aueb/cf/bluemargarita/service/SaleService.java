package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.sale.SaleInsertDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.*;
import gr.aueb.cf.bluemargarita.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SaleService implements ISaleService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SaleService.class);

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final SalePricingService pricingService;
    private final Mapper mapper;

    @Autowired
    public SaleService(SaleRepository saleRepository,
                       ProductRepository productRepository,
                       CustomerRepository customerRepository,
                       LocationRepository locationRepository,
                       UserRepository userRepository,
                       SalePricingService pricingService,
                       Mapper mapper) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO createSale(SaleInsertDTO dto)
            throws EntityNotFoundException, ValidationException {

        // Validate entities
        Location location = getLocationById(dto.locationId());
        Customer customer = dto.customerId() != null ? getCustomerById(dto.customerId()) : null;
        User creator = getUserById(dto.creatorUserId());

        // Validate products exist and quantities are positive
        Map<Product, BigDecimal> validatedProducts = validateProducts(dto.products());

        // Create sale entity with basic fields
        Sale sale = Sale.builder()
                .customer(customer)
                .location(location)
                .saleDate(dto.saleDate())
                .finalTotalPrice(dto.finalTotalPrice()) // User-defined final price
                .packagingPrice(dto.packagingPrice())
                .paymentMethod(dto.paymentMethod())
                .build();

        // Set audit fields
        sale.setCreatedBy(creator);
        sale.setLastUpdatedBy(creator);

        // Add products using your existing addProduct method
        for (Map.Entry<Product, BigDecimal> entry : validatedProducts.entrySet()) {
            sale.addProduct(entry.getKey(), entry.getValue());
        }

        // Now calculate and update pricing using the service
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        // Update customer's first sale date if needed
        updateCustomerFirstSaleDate(customer, dto.saleDate());

        LOGGER.info("Sale created with id: {}, Suggested total: {}, Final total: {}, Discount: {}%",
                savedSale.getId(),
                savedSale.getSuggestedTotalPrice(),
                savedSale.getFinalTotalPrice(),
                savedSale.getDiscountPercentage());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO updateSaleFinalPrice(Long saleId, BigDecimal newFinalPrice, Long updaterUserId)
            throws EntityNotFoundException {

        Sale sale = getSaleById(saleId);
        User updater = getUserById(updaterUserId);

        BigDecimal oldFinalPrice = sale.getFinalTotalPrice();
        BigDecimal oldDiscountPercentage = sale.getDiscountPercentage();

        // Update final price
        sale.setFinalTotalPrice(newFinalPrice);
        sale.setLastUpdatedBy(updater);

        // Recalculate all pricing with new discount
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        LOGGER.info("Sale {} final price updated from {} to {}. Discount changed from {}% to {}%",
                saleId, oldFinalPrice, newFinalPrice, oldDiscountPercentage, sale.getDiscountPercentage());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO addProductToSale(Long saleId, Long productId, BigDecimal quantity, Long updaterUserId)
            throws EntityNotFoundException {

        Sale sale = getSaleById(saleId);
        Product product = getProductById(productId);
        User updater = getUserById(updaterUserId);

        // Use your existing addProduct method
        sale.addProduct(product, quantity);
        sale.setLastUpdatedBy(updater);

        // Recalculate pricing after adding product
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        LOGGER.info("Product {} added to sale {}. New suggested total: {}, Final total: {}",
                product.getName(), saleId, sale.getSuggestedTotalPrice(), sale.getFinalTotalPrice());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO removeProductFromSale(Long saleId, Long productId, Long updaterUserId)
            throws EntityNotFoundException {

        Sale sale = getSaleById(saleId);
        Product product = getProductById(productId);
        User updater = getUserById(updaterUserId);

        // Use your existing removeProduct method
        sale.removeProduct(product);
        sale.setLastUpdatedBy(updater);

        // Recalculate pricing after removing product
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        LOGGER.info("Product {} removed from sale {}. New suggested total: {}, Final total: {}",
                product.getName(), saleId, sale.getSuggestedTotalPrice(), sale.getFinalTotalPrice());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SaleReadOnlyDTO updateProductQuantityInSale(Long saleId, Long productId, BigDecimal newQuantity, Long updaterUserId)
            throws EntityNotFoundException {

        Sale sale = getSaleById(saleId);
        Product product = getProductById(productId);
        User updater = getUserById(updaterUserId);

        // Find the existing sale product
        SaleProduct saleProduct = sale.getAllSaleProducts().stream()
                .filter(sp -> sp.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("SaleProduct",
                        "Product with id " + productId + " not found in sale " + saleId));

        BigDecimal oldQuantity = saleProduct.getQuantity();

        // Update quantity
        saleProduct.setQuantity(newQuantity);
        sale.setLastUpdatedBy(updater);

        // Recalculate pricing with new quantity
        updateSalePricingWithDiscount(sale);

        Sale savedSale = saleRepository.save(sale);

        LOGGER.info("Product {} quantity updated from {} to {} in sale {}. New total: {}",
                product.getName(), oldQuantity, newQuantity, saleId, sale.getFinalTotalPrice());

        return mapper.mapToSaleReadOnlyDTO(savedSale);
    }

    /**
     * Main method to update sale pricing with discount calculations
     * This works with your existing Sale structure
     */
    private void updateSalePricingWithDiscount(Sale sale) {
        // Step 1: Calculate suggested total from current products
        BigDecimal suggestedTotal = pricingService.calculateSuggestedTotalFromSale(sale);
        sale.setSuggestedTotalPrice(suggestedTotal);

        // Step 2: Calculate discount percentage based on user's final price
        BigDecimal discountPercentage = pricingService.calculateDiscountPercentage(
                suggestedTotal, sale.getFinalTotalPrice());
        sale.setDiscountPercentage(discountPercentage);

        // Step 3: Update each SaleProduct with discounted prices
        sale.getAllSaleProducts().forEach(saleProduct -> {
            // Store the suggested price (before discount)
            saleProduct.setSuggestedPriceAtTheTime(saleProduct.getProduct().getFinalSellingPriceRetail());

            // Calculate and store the actual price (after discount)
            BigDecimal actualPrice = pricingService.calculateActualSellingPrice(
                    saleProduct.getProduct(), discountPercentage);
            saleProduct.setPriceAtTheTime(actualPrice);
        });

        LOGGER.debug("Updated sale {} pricing - Suggested: {}, Final: {}, Discount: {}%",
                sale.getId(), suggestedTotal, sale.getFinalTotalPrice(), discountPercentage);
    }

    // Private helper methods
    private Map<Product, BigDecimal> validateProducts(Map<Long, BigDecimal> productQuantities)
            throws EntityNotFoundException, ValidationException {

        Map<Product, BigDecimal> validatedProducts = new HashMap<>();

        for (Map.Entry<Long, BigDecimal> entry : productQuantities.entrySet()) {
            Product product = getProductById(entry.getKey());
            BigDecimal quantity = entry.getValue();

            if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("Quantity must be greater than 0 for product: " + product.getName());
            }

            validatedProducts.put(product, quantity);
        }

        return validatedProducts;
    }

    private Location getLocationById(Long id) throws EntityNotFoundException {
        return locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location", "Location with id " + id + " not found"));
    }

    private Customer getCustomerById(Long id) throws EntityNotFoundException {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer", "Customer with id " + id + " not found"));
    }

    private User getUserById(Long id) throws EntityNotFoundException {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + id + " not found"));
    }

    private Product getProductById(Long id) throws EntityNotFoundException {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product", "Product with id " + id + " not found"));
    }

    private Sale getSaleById(Long id) throws EntityNotFoundException {
        return saleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sale", "Sale with id " + id + " not found"));
    }

    private void updateCustomerFirstSaleDate(Customer customer, LocalDate saleDate) {
        if (customer != null && customer.getFirstSaleDate() == null) {
            customer.setFirstSaleDate(saleDate);
            customerRepository.save(customer);
        }
    }
}