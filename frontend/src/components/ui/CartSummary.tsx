import React, { useState, useEffect } from 'react';
import {Percent, ShoppingCart, Euro} from 'lucide-react';
import { Button, LoadingSpinner } from './index';
import { PriceCalculationResponseDTO } from '../../types/api/recordSaleInterface';
import { StyledNumberInput } from './StyledInput';

interface CartSummaryProps {
    pricing: PriceCalculationResponseDTO;
    userFinalPrice: number;
    userDiscountPercentage: number;
    onFinalPriceChange: (price: number) => void;
    onDiscountPercentageChange: (percentage: number) => void;
    formatMoney: (amount: number) => string;
    onRecordSale: () => void;
    submitting: boolean;
    cartItemsCount: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
                                                     pricing,
                                                     userFinalPrice,
                                                     userDiscountPercentage,
                                                     onFinalPriceChange,
                                                     onDiscountPercentageChange,
                                                     formatMoney,
                                                     onRecordSale,
                                                     submitting,
                                                     cartItemsCount
                                                 }) => {
    const [isUpdatingFromDiscount, setIsUpdatingFromDiscount] = useState(false);
    const [isUpdatingFromPrice, setIsUpdatingFromPrice] = useState(false);

    // Calculate suggested total (subtotal + packaging)
    const suggestedTotal = pricing.subtotal + pricing.packagingCost;

    // Reset final price to suggested total when cart changes
    useEffect(() => {
        if (cartItemsCount > 0) {
            onFinalPriceChange(suggestedTotal);
            onDiscountPercentageChange(0);
        }
    }, [cartItemsCount, suggestedTotal]);

    const handleFinalPriceChange = (value: number) => {
        // Prevent infinite loop if we're already updating from discount
        if (isUpdatingFromDiscount) return;

        setIsUpdatingFromPrice(true);

        // Calculate discount percentage based on final price
        let discountPercentage = 0;
        if (suggestedTotal > 0 && value < suggestedTotal) {
            discountPercentage = ((suggestedTotal - value) / suggestedTotal) * 100;
        }

        onFinalPriceChange(value);
        onDiscountPercentageChange(Math.round(discountPercentage * 10) / 10); // Round to 1 decimal

        setIsUpdatingFromPrice(false);
    };

    const handleDiscountPercentageChange = (value: number) => {
        // Prevent infinite loop if we're already updating from price
        if (isUpdatingFromPrice) return;

        setIsUpdatingFromDiscount(true);

        // Calculate final price based on discount percentage
        const finalPrice = suggestedTotal - (suggestedTotal * (value / 100));

        onDiscountPercentageChange(value);
        onFinalPriceChange(Math.round(finalPrice * 100) / 100); // Round to 2 decimals

        setIsUpdatingFromDiscount(false);
    };

    return (
        <div className="w-full h-full flex flex-col space-y-6 p-6">
            {/* Subtotal & Packaging - Smaller */}
            <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Αρχική Αξία Προϊόντων:</span>
                    <span className="text-sm font-medium">{formatMoney(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Κόστος Συσκευασίας:</span>
                    <span className="text-sm font-medium">{formatMoney(pricing.packagingCost)}</span>
                </div>
            </div>

            {/* Suggested Total */}
            <div className="flex justify-between items-center py-3 border-y-2 border-gray-300">
                <span className="text-xl font-semibold text-gray-800">Προτεινόμενη Συνολική Τιμή:</span>
                <span className="text-xl font-bold text-gray-900">{formatMoney(suggestedTotal)}</span>
            </div>

            {/* Price Adjustment - Two Input Fields */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Εκπτώσεις</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Discount Percentage Input - Using StyledNumberInput */}
                    <div>
                        <StyledNumberInput
                            label={
                                <span className="flex items-center">
                        Ποσοστό Έκπτωσης
                    </span>
                            }
                            value={userDiscountPercentage}
                            onChange={handleDiscountPercentageChange}
                            placeholder="0"
                            icon={<Percent className="w-5 h-5 text-purple-500" />}
                            min={0}
                            max={100}
                            step={0.1}
                        />
                    </div>

                    {/* Final Price Input - Using StyledNumberInput */}
                    <div>
                        <StyledNumberInput
                            label={
                                <span className="flex items-center">
                        Τελική Τιμή (€)
                    </span>
                            }
                            value={userFinalPrice}
                            onChange={handleFinalPriceChange}
                            placeholder="0.00"
                            icon={<Euro className="w-5 h-5 text-green-500" />}
                            min={0}
                            step={0.01}
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                    Συμπληρώστε οποιοδήποτε πεδίο - το άλλο ενημερώνεται αυτόματα
                </p>
            </div>

            {/* Discount Display */}
            {pricing.discountAmount > 0 && (
                <div className="flex justify-between items-center py-4 text-green-600 bg-green-50 px-6 rounded-lg border border-green-200">
                    <span className="text-lg font-medium">Εφαρμόστηκε Έκπτωση ({pricing.discountPercentage.toFixed(1)}%):</span>
                    <span className="text-lg font-semibold">-{formatMoney(pricing.discountAmount)}</span>
                </div>
            )}

            {/* Final Total - Updates based on user input */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-900">Τελική Τιμή:</span>
                    <span className="text-3xl font-bold text-blue-600">
                        {formatMoney(pricing.finalPrice)}
                    </span>
                </div>
            </div>

            {/* Item Breakdown */}
            <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Προϊόντα στην πώληση:</h4>
                <div className="space-y-3">
                    {pricing.calculatedItems.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium mr-4">
                                {item.productName} x{item.quantity}
                            </span>
                            <span className="text-gray-900 font-semibold text-md">
                                Αρχική: {formatMoney(item.totalPrice)}
                            </span>
                            <span className="text-gray-900 font-semibold text-md">
                                Τελική: {formatMoney((item.totalPrice) - (item.totalPrice * pricing.discountPercentage / 100))}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Record Sale Button */}
            <div className="pt-6 border-t border-gray-200">
                <Button
                    onClick={onRecordSale}
                    disabled={submitting}
                    variant="success"
                    size="lg"
                    className="w-full h-20 text-xl font-bold shadow-xl"
                >
                    {submitting ? (
                        <>
                            <LoadingSpinner/>
                            <span className="text-lg">Recording Sale...</span>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center mb-1">
                                    <ShoppingCart className="w-7 h-7 mr-2" />
                                    <span>Καταγραφή Πώλησης</span>
                                </div>
                            </div>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default CartSummary;