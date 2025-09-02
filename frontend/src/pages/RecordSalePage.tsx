import React, { useState, useEffect } from 'react';
import { recordSaleService } from '../services/recordSaleService';
import {
    RecordPageDataDTO,
    RecordSaleRequestDTO,
    ProductSearchResultDTO,
    CartItemDTO,
    PriceCalculationRequestDTO,
    PriceCalculationResponseDTO,
} from "../types/api/recordSaleInterface.ts";
import { SaleDetailedViewDTO } from "../types/api/saleInterface.ts";
import { SaleSuccessModal } from '../components/ui/modals';
import { CustomerSearchResultDTO } from "../types/api/customerInterface.ts";
import { Button, LoadingSpinner, Alert, CustomCard, FlexibleHeightCard } from '../components/ui/common';
import CartSummary from '../components/ui/cart/CartSummary.tsx';
import CartItem from '../components/ui/cart/CartItem.tsx';
import { ShoppingCart, User, MapPin, CreditCard, Package, Calculator, Mail, X, Calendar } from 'lucide-react';
import {transformCustomersForDropdown, transformProductsForDropdown } from "../utils/searchDropdownTransformations.ts";
import { CustomNumberInput, CustomDateInput, CustomRadioGroup, CustomSelect, CustomSearchDropdown } from "../components/ui/inputs";

interface RecordSalePageProps {
    onNavigate: (page: string) => void;
}

const RecordSalePage: React.FC<RecordSalePageProps> = ({ onNavigate }) => {
    // Page data and loading states
    const [pageData, setPageData] = useState<RecordPageDataDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Form states
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResultDTO | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [isWholesale, setIsWholesale] = useState<boolean>(false);
    const [packagingCost, setPackagingCost] = useState<number>(0);
    const [userFinalPrice, setUserFinalPrice] = useState<number>(0);
    const [userDiscountPercentage, setUserDiscountPercentage] = useState<number>(0);
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Cart states
    const [cart, setCart] = useState<CartItemDTO[]>([]);
    const [cartPricing, setCartPricing] = useState<PriceCalculationResponseDTO | null>(null);

    // Search states
    const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
    const [productSearchTerm, setProductSearchTerm] = useState<string>('');
    const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResultDTO[]>([]);
    const [productSearchResults, setProductSearchResults] = useState<ProductSearchResultDTO[]>([]);

    //Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [recordedSaleDetails, setRecordedSaleDetails] = useState<SaleDetailedViewDTO | null>(null);


    // Format money helper
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const transformedCustomerResults = transformCustomersForDropdown(customerSearchResults);
    const transformedProductResults = transformProductsForDropdown(productSearchResults);

    // Load page data on mount
    useEffect(() => {
        loadPageData();
    }, []);

    // Calculate pricing when cart changes or wholesale mode changes
    useEffect(() => {
        if (cart.length > 0) {
            console.log('Cart changed, calculating pricing...', { cart, isWholesale, packagingCost });
            calculatePricing();
        } else {
            // When cart is empty, just clear the pricing - don't reset user inputs
            setCartPricing(null);
        }
    }, [cart, isWholesale, packagingCost]);

    // Only recalculate when user manually changes discount inputs
    useEffect(() => {
        // Only recalculate if we have items AND user has actually entered values
        if (cart.length > 0 && cartPricing && (userFinalPrice > 0 || userDiscountPercentage > 0)) {
            console.log('User input changed, recalculating...', { userFinalPrice, userDiscountPercentage });
            // Add a small delay to prevent rapid recalculations while user is typing
            const timeoutId = setTimeout(() => {
                calculatePricing();
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [userFinalPrice, userDiscountPercentage]);

    // ALL FUNCTION DEFINITIONS BELOW HERE
    const loadPageData = async () => {
        try {
            setLoading(true);
            const data = await recordSaleService.getRecordSalePageData();
            setPageData(data);

            // Set defaults
            if (data.locations.length > 0) {
                setSelectedLocation(data.locations[0].id);
            }
            if (data.paymentMethods.length > 0) {
                setSelectedPaymentMethod(data.paymentMethods[0].value);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load page data');
        } finally {
            setLoading(false);
        }
    };

    const searchCustomers = async (searchTerm: string): Promise<void> => {
        if (searchTerm.length < 2) {
            setCustomerSearchResults([]);
            return;
        }

        setIsLoadingCustomers(true);
        try {
            const results = await recordSaleService.searchCustomers(searchTerm);
            setCustomerSearchResults(results);
        } catch (err) {
            console.error('Customer search error:', err);
            setCustomerSearchResults([]);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const searchProducts = async (searchTerm: string): Promise<void> => {
        if (searchTerm.length < 2) {
            setProductSearchResults([]);
            return;
        }

        setIsLoadingProducts(true);
        try {
            const results = await recordSaleService.searchProducts(searchTerm);
            setProductSearchResults(results);
        } catch (err) {
            console.error('Product search error:', err);
            setProductSearchResults([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Handle wholesale toggle - recalculate all cart items with new pricing
    const handleWholesaleChange = async (newIsWholesale: boolean) => {
        setIsWholesale(newIsWholesale);

        if (cart.length > 0) {
            try {
                // Recalculate all cart items with new wholesale/retail pricing
                const updatedCartItems = await Promise.all(
                    cart.map(item =>
                        recordSaleService.getProductForCart(item.productId, item.quantity, newIsWholesale)
                    )
                );
                setCart(updatedCartItems);
            } catch (err) {
                console.error(err)
                setError('Failed to update pricing mode');
            }
        }
    };

    const addProductToCart = async (product: ProductSearchResultDTO, quantity: number = 1) => {
        try {
            const cartItem = await recordSaleService.getProductForCart(product.id, quantity, isWholesale);

            // Check if product already in cart
            const existingIndex = cart.findIndex(item => item.productId === product.id);
            if (existingIndex >= 0) {
                // Update quantity
                const updatedCart = [...cart];
                updatedCart[existingIndex] = {
                    ...cartItem,
                    quantity: updatedCart[existingIndex].quantity + quantity
                };
                setCart(updatedCart);
            } else {
                // Add new item
                setCart([...cart, cartItem]);
            }

            // Clear search
            setProductSearchTerm('');
            setProductSearchResults([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add product to cart');
        }
    };

    const updateCartItemQuantity = async (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        try {
            const cartItem = await recordSaleService.getProductForCart(productId, newQuantity, isWholesale);
            const updatedCart = cart.map(item =>
                item.productId === productId ? cartItem : item
            );
            setCart(updatedCart);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update cart item');
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const calculatePricing = async () => {
        if (cart.length === 0) {
            console.log('No items in cart, skipping pricing calculation');
            return;
        }

        try {
            console.log('Starting pricing calculation...', {
                cartItems: cart.length,
                isWholesale,
                packagingCost,
                userFinalPrice,
                userDiscountPercentage
            });

            // Calculate the suggested total from cart items + packaging
            const subtotal = cart.reduce((sum, item) => sum + (item.suggestedPrice * item.quantity), 0);
            const suggestedTotal = subtotal + Number(packagingCost);

            const roundToTwoDecimals = (value: number): number => {
                return Math.round(value * 100) / 100;
            };

            const request: PriceCalculationRequestDTO = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: Number(item.quantity)
                })),
                isWholesale: isWholesale,
                packagingCost: roundToTwoDecimals(Number(packagingCost) || 0),
                // Use suggested total as default if user hasn't input a custom final price
                userFinalPrice: userFinalPrice > 0
                    ? roundToTwoDecimals(Number(userFinalPrice))  // Round final price
                    : roundToTwoDecimals(suggestedTotal),
                userDiscountPercentage: roundToTwoDecimals(Number(userDiscountPercentage) || 0)
            };

            console.log('Sending pricing request:', request);
            const pricing = await recordSaleService.calculateCartPricing(request);
            console.log('Received pricing response:', pricing);

            setCartPricing(pricing);
        } catch (err) {
            console.error('Pricing calculation error:', err);
            setError(err instanceof Error ? err.message : 'Failed to calculate pricing');
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            const request: RecordSaleRequestDTO = {
                customerId: selectedCustomer?.id,
                locationId: selectedLocation!,
                paymentMethod: selectedPaymentMethod,
                isWholesale,
                packagingCost,
                finalPrice: cartPricing?.finalPrice || 0,
                saleDate,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const result = await recordSaleService.recordSale(request);
            setRecordedSaleDetails(result);
            setShowSuccessModal(true);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record sale');
        } finally {
            setSubmitting(false);
        }
    };

    const validateForm = (): boolean => {
        if (!selectedLocation) {
            setError('Please select a location');
            return false;
        }
        if (!selectedPaymentMethod) {
            setError('Please select a payment method');
            return false;
        }
        if (cart.length === 0) {
            setError('Please add at least one product to the cart');
            return false;
        }
        return true;
    };

    if (loading || !pageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner/>
            </div>
        );
    }

    if (error && !pageData) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="error" title="Error Loading Page">
                        {error}
                        <Button onClick={loadPageData} variant="primary" className="mt-4">
                            Try Again
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {error && (
                    <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
                        <div className="lg:col-span-2 min-w-0">
                            <CustomCard
                                height="md"
                            >
                                <div className="space-y-4 pl-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <CustomSearchDropdown
                                                label = "Προϊόντα"
                                                searchTerm={productSearchTerm}
                                                onSearchTermChange={(term: string) => {
                                                    setProductSearchTerm(term);
                                                    searchProducts(term);
                                                }}
                                                searchResults={transformedProductResults}
                                                onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                                    const product = productSearchResults.find(p => p.id === item.id);
                                                    if (product) {
                                                        addProductToCart(product);
                                                        setProductSearchTerm('');
                                                        setProductSearchResults([]);
                                                    }
                                                }}
                                                placeholder="Αναζήτηση προϊόντων..."
                                                entityType="product"
                                                isLoading={isLoadingProducts}
                                                emptyMessage="No products found"
                                                emptySubMessage="Try searching by name or code"
                                                renderItem={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-0.5">
                                                            {item.subtitle}
                                                        </div>
                                                    </div>
                                                )}
                                                renderAdditionalInfo={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                        <Package className="w-3 h-3 inline mr-1" />
                                                        {item.additionalInfo}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Sale Date */}
                                        <CustomDateInput
                                            label="Ημερομηνία"
                                            value={saleDate}
                                            onChange={setSaleDate}
                                            icon={<Calendar className="w-5 h-5 text-purple-500" />}
                                        />
                                        <div className="pr-2">
                                            <CustomNumberInput
                                                label="Κόστος Συσκευασίας (€)"
                                                value={packagingCost}
                                                onChange={setPackagingCost}
                                                placeholder="0.00"
                                                icon={<Package className="w-5 h-5 text-orange-500" />}
                                                step={0.5}
                                                min={0}
                                                autoRoundDecimals={true}
                                            />
                                        </div>


                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <CustomSelect
                                                label="Τοποθεσία"
                                                value={selectedLocation || ''}
                                                onChange={(value) => setSelectedLocation(Number(value))}
                                                options={pageData.locations.map(location => ({
                                                    value: location.id,
                                                    label: location.name
                                                }))}
                                                placeholder="Select location..."
                                                icon={<MapPin className="w-5 h-5 text-blue-500" />}
                                            />
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <CustomSelect
                                                label="Μέθοδος Πληρωμής"
                                                value={selectedPaymentMethod}
                                                onChange={(value) => setSelectedPaymentMethod(String(value))}
                                                options={pageData.paymentMethods.map(method => ({
                                                    value: method.value,
                                                    label: method.displayName
                                                }))}
                                                placeholder="Select payment method..."
                                                icon={<CreditCard className="w-5 h-5 text-green-500" />}
                                            />
                                        </div>

                                        {/* Customer Search */}
                                        <div className="pr-2">
                                            <CustomSearchDropdown
                                                label = "Πελάτης (Προαιρετικό)"
                                                searchTerm={customerSearchTerm}
                                                onSearchTermChange={(term: string) => {
                                                    setCustomerSearchTerm(term);
                                                    searchCustomers(term);
                                                }}
                                                searchResults={transformedCustomerResults}
                                                onSelect={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => {
                                                    const customer = customerSearchResults.find(c => c.id === item.id);
                                                    if (customer) {
                                                        setSelectedCustomer(customer);
                                                        setCustomerSearchTerm('');
                                                        setCustomerSearchResults([]);
                                                    }
                                                }}
                                                placeholder="Αναζήτηση πελάτη..."
                                                entityType="customer"
                                                isLoading={isLoadingCustomers}
                                                emptyMessage="No customers found"
                                                emptySubMessage="Try searching by name or email"
                                                renderItem={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-0.5 flex items-center space-x-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span>{item.subtitle}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                renderAdditionalInfo={(item: { id: number; name: string; subtitle?: string; additionalInfo?: string }) => (
                                                    <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                        <User className="w-3 h-3 inline mr-1" />
                                                        {item.additionalInfo}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        {/* Wholesale Toggle */}
                                        <div className="h-[72px] flex flex-col justify-start">
                                            <CustomRadioGroup
                                                value={isWholesale ? 'wholesale' : 'retail'}
                                                onChange={(value) => handleWholesaleChange(value === 'wholesale')}
                                                options={[
                                                    { value: 'retail', label: 'Λιανική' },
                                                    { value: 'wholesale', label: 'Χονδρική' }
                                                ]}
                                            />
                                        </div>

                                        <div className="h-[72px]">
                                            {/* Intentionally empty for spacing */}
                                        </div>

                                        <div className="h-[72px] flex items-start pr-2 pb-2">
                                            {selectedCustomer ? (
                                                <div className="w-full p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => setSelectedCustomer(null)}
                                                                className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 hover:bg-indigo-100 rounded"
                                                                title="Clear selection"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            <div>
                                                                <p className="font-medium text-indigo-900 text-sm">{selectedCustomer.fullName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Empty placeholder to maintain grid structure
                                                <div className="w-full h-full"></div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </CustomCard>
                        </div>

                        {/* Cart Items Card - 1/3 width, reduced height */}
                        <div className="lg:col-span-1 min-w-0">
                            <CustomCard
                                title={`Καλάθι (${cart.length})`}
                                icon={<ShoppingCart className="w-5 h-5" />}
                                height="md"
                            >
                                <div className="h-full overflow-y-auto overflow-x-hidden min-w-0">
                                    {cart.length === 0 ? (
                                        <div className="text-center text-gray-500 py-6">
                                            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Άδειο καλάθι</p>
                                            <p className="text-xs">Προσθέστε προϊόντα στο καλάθι</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 min-w-0 w-full">
                                            {cart.map((item) => (
                                                <CartItem
                                                    key={item.productId}
                                                    item={item}
                                                    onUpdateQuantity={(quantity) => updateCartItemQuantity(item.productId, quantity)}
                                                    onRemove={() => removeFromCart(item.productId)}
                                                    formatMoney={formatMoney}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CustomCard>
                        </div>
                    </div>

                    {/* Bottom Row - Order Summary & Checkout (Single Card) */}
                    <FlexibleHeightCard
                        title="Ανάλυση Πώλησης"
                        icon={<Calculator className="w-5 h-5" />}
                    >
                        <div className="min-w-0">
                            {cart.length > 0 ? (
                                cartPricing ? (
                                    <CartSummary
                                        pricing={cartPricing}
                                        userFinalPrice={userFinalPrice}
                                        userDiscountPercentage={userDiscountPercentage}
                                        onFinalPriceChange={setUserFinalPrice}
                                        onDiscountPercentageChange={setUserDiscountPercentage}
                                        formatMoney={formatMoney}
                                        onRecordSale={handleSubmit}
                                        submitting={submitting}
                                        cartItemsCount={cart.length}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                            <p className="text-2xl text-gray-600 mb-2">Calculating prices...</p>
                                            <p className="text-lg text-gray-500">Please wait while we process your cart</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center text-gray-500">
                                        <Calculator className="w-24 h-24 mx-auto mb-8 opacity-30" />
                                        <p className="text-3xl font-semibold mb-4">Δεν έχουν προστεθεί προϊόντα</p>
                                        <p className="text-xl">Προσθέστε προϊόντα και οι τιμές τους θα εμφανιστούν εδώ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FlexibleHeightCard>
                </div>
            </div>

            {showSuccessModal && recordedSaleDetails && (
                <SaleSuccessModal
                    sale={recordedSaleDetails}
                    onClose={() => {
                        setShowSuccessModal(false);
                        // Reset form for new sale
                        setSelectedCustomer(null);
                        setSelectedLocation(null);
                        setSelectedPaymentMethod('');
                        setCart([]);
                        setCartPricing(null);
                        setUserFinalPrice(0);
                        setUserDiscountPercentage(0);
                        setPackagingCost(0);
                        setSaleDate(new Date().toISOString().split('T')[0]);
                        setError(null);
                        setRecordedSaleDetails(null);
                        onNavigate('record-sale');
                    }}
                />
            )}
        </div>
    );
};

export default RecordSalePage;