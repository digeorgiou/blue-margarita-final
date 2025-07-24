import React, { useState, useEffect } from 'react';
import { recordSaleService } from '../services/recordSaleService';
import {
    RecordPageDataDTO,
    RecordSaleRequestDTO,
    ProductSearchResultDTO,
    CartItemDTO,
    PriceCalculationRequestDTO,
    PriceCalculationResponseDTO, SaleDetailedViewDTO,
} from "../types/api/recordSaleInterface.ts";
import { Modal } from '../components/ui/modals/Modal'; // Assuming you have a Modal component
import { CustomerSearchResultDTO } from "../types/api/customerInterface.ts";
import { Button, LoadingSpinner, Input, Alert, CustomerSearchDropdown, ProductSearchDropdown } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import CartSummary from '../components/ui/CartSummary';
import CartItem from '../components/ui/CartItem';
import { ShoppingCart, User, MapPin, CreditCard, Package, Calculator, CheckCircle } from 'lucide-react';

interface RecordSalePageProps {
    onNavigate: (page: string) => void;
}

const RecordSalePage: React.FC<RecordSalePageProps> = ({ onNavigate }) => {
    // Page data and loading states
    const [pageData, setPageData] = useState<RecordPageDataDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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

    const searchCustomers = async (searchTerm: string) => {
        if (searchTerm.length < 2) {
            setCustomerSearchResults([]);
            return;
        }

        try {
            const results = await recordSaleService.searchCustomers(searchTerm);
            setCustomerSearchResults(results);
        } catch (err) {
            console.error('Customer search error:', err);
        }
    };

    const searchProducts = async (searchTerm: string) => {
        if (searchTerm.length < 2) {
            setProductSearchResults([]);
            return;
        }

        try {
            const results = await recordSaleService.searchProducts(searchTerm);
            setProductSearchResults(results);
        } catch (err) {
            console.error('Product search error:', err);
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

            const request: PriceCalculationRequestDTO = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: Number(item.quantity)
                })),
                isWholesale: isWholesale,
                packagingCost: Number(packagingCost) || 0,
                // Use suggested total as default if user hasn't input a custom final price
                userFinalPrice: userFinalPrice > 0 ? Number(userFinalPrice) : suggestedTotal,
                userDiscountPercentage: Number(userDiscountPercentage) || 0
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
                })),
                creatorUserId: 1 // TODO: Get from auth context
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

    if (loading) {
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <DashboardCard
                                height="sm"
                            >
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Package className="w-4 h-4 inline mr-1" />
                                                Προϊόντα
                                            </label>
                                            <ProductSearchDropdown
                                                searchTerm={productSearchTerm}
                                                onSearchChange={(term) => {
                                                    setProductSearchTerm(term);
                                                    searchProducts(term);
                                                }}
                                                searchResults={productSearchResults}
                                                onSelectProduct={(product) => addProductToCart(product)}
                                                placeholder="Αναζήτηση προϊόντων..."
                                            />
                                        </div>

                                        {/* Sale Date */}
                                        <Input
                                            label="Ημερομηνία"
                                            type="date"
                                            value={saleDate}
                                            onChange={(e) => setSaleDate(e.target.value)}
                                        />

                                        {/* Wholesale Toggle */}
                                        <div className="flex flex-col justify-end">
                                            <div className="flex items-center h-10">
                                                <input
                                                    type="checkbox"
                                                    id="wholesale"
                                                    checked={isWholesale}
                                                    onChange={(e) => handleWholesaleChange(e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="wholesale" className="ml-2 block text-sm text-gray-700">
                                                    Πώληση Χονδρικής
                                                    <span className="block text-xs text-gray-500">
                                                        {isWholesale ? 'Τιμές Χονδρικής' : 'Τιμές Λιανικής'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <MapPin className="w-4 h-4 inline mr-1" />
                                                Τοποθεσία
                                            </label>
                                            <select
                                                value={selectedLocation || ''}
                                                onChange={(e) => setSelectedLocation(Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            >
                                                <option value="">Select location</option>
                                                {pageData?.locations.map((location) => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CreditCard className="w-4 h-4 inline mr-1" />
                                                Τρόπος Πληρωμής
                                            </label>
                                            <select
                                                value={selectedPaymentMethod}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            >
                                                <option value="">Select payment method</option>
                                                {pageData?.paymentMethods.map((method) => (
                                                    <option key={method.value} value={method.value}>
                                                        {method.displayName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <Input
                                            label="Κόστος Συσκευασίας (€)"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={packagingCost}
                                            onChange={(e) => setPackagingCost(Number(e.target.value) || 0)}
                                            placeholder="1"
                                        />

                                        {/* Customer Search */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="w-4 h-4 inline mr-1" />
                                                Πελάτης (Προαιρετικό)
                                            </label>
                                            <CustomerSearchDropdown
                                                searchTerm={customerSearchTerm}
                                                onSearchChange={(term) => {
                                                    setCustomerSearchTerm(term);
                                                    searchCustomers(term);
                                                }}
                                                searchResults={customerSearchResults}
                                                selectedCustomer={selectedCustomer}
                                                onSelectCustomer={(customer) => {
                                                    setSelectedCustomer(customer);
                                                    setCustomerSearchTerm('');
                                                    setCustomerSearchResults([]);
                                                }}
                                                onClearSelection={() => setSelectedCustomer(null)}
                                                placeholder="Αναζήτηση πελάτη..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DashboardCard>
                        </div>

                        {/* Cart Items Card - 1/3 width, reduced height */}
                        <div className="lg:col-span-1">
                            <DashboardCard
                                title={`Καλάθι (${cart.length})`}
                                icon={<ShoppingCart className="w-5 h-5" />}
                                height="sm"
                            >
                                <div className="h-full overflow-y-auto">
                                    {cart.length === 0 ? (
                                        <div className="text-center text-gray-500 py-6">
                                            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Άδειο καλάθι</p>
                                            <p className="text-xs">Προσθέστε προϊόντα στο καλάθι</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
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
                            </DashboardCard>
                        </div>
                    </div>

                    {/* Bottom Row - Order Summary & Checkout (Single Card) */}
                    <DashboardCard
                        title="Ανάλυση Πώλησης"
                        icon={<Calculator className="w-5 h-5" />}
                        height="xl"
                        className="min-h-[700px]"
                    >
                        <div className="h-full">
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
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                            <p className="text-2xl text-gray-600 mb-2">Calculating prices...</p>
                                            <p className="text-lg text-gray-500">Please wait while we process your cart</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-500">
                                        <Calculator className="w-24 h-24 mx-auto mb-8 opacity-30" />
                                        <p className="text-3xl font-semibold mb-4">Add products to see pricing</p>
                                        <p className="text-xl">Product totals, discounts, and final pricing will appear here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>

            {showSuccessModal && recordedSaleDetails && (
                <Modal onClose={() => {
                    setShowSuccessModal(false);
                    onNavigate('dashboard');
                }}>
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                            Η πώληση καταγράφηκε με επιτυχία!
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Αριθμός Πώλησης: #{recordedSaleDetails.saleId}
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Ημερομηνία:</p>
                                    <p className="text-sm">{recordedSaleDetails.saleDate}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Τοποθεσία:</p>
                                    <p className="text-sm">{recordedSaleDetails.location.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Τρόπος Πληρωμής:</p>
                                    <p className="text-sm">{recordedSaleDetails.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Τύπος:</p>
                                    <p className="text-sm">{recordedSaleDetails.isWholesale ? 'Χονδρική' : 'Λιανική'}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <p className="text-sm font-medium">Συνολική Αξία:</p>
                                    <p className="text-sm font-medium">{formatMoney(recordedSaleDetails.subtotal)}</p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="text-sm font-medium">Συσκευασία:</p>
                                    <p className="text-sm font-medium">{formatMoney(recordedSaleDetails.packagingCost)}</p>
                                </div>
                                {recordedSaleDetails.discountAmount > 0 && (
                                    <div className="flex justify-between mb-2 text-red-600">
                                        <p className="text-sm font-medium">Έκπτωση ({recordedSaleDetails.discountPercentage.toFixed(1)}%):</p>
                                        <p className="text-sm font-medium">-{formatMoney(recordedSaleDetails.discountAmount)}</p>
                                    </div>
                                )}
                                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-lg font-bold">Τελικό Ποσό:</p>
                                    <p className="text-lg font-bold">{formatMoney(recordedSaleDetails.finalTotal)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6">
                            <Button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onNavigate('dashboard');
                                }}
                                variant="primary"
                                className="w-full justify-center"
                            >
                                Κλείσιμο
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default RecordSalePage;