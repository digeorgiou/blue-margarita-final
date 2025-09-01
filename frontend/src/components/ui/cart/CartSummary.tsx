// Replace your CartSummary.tsx with this mobile-fixed version
import React, { useState, useEffect } from 'react';
import {Percent, ShoppingCart, Euro} from 'lucide-react';
import { Button, LoadingSpinner } from '../index.ts';
import { PriceCalculationResponseDTO } from '../../../types/api/recordSaleInterface.ts';
import { CustomNumberInput } from "../inputs";

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

    /**
     * Calculates discount percentage exactly as the backend does when saving to database
     */
    const calculateDiscountPercentageExact = (suggestedTotal: number, finalPrice: number): number => {
        if (suggestedTotal === 0) return 0;

        // Step 1: Calculate discount amount
        const discount = suggestedTotal - finalPrice;

        // Step 2: Divide with 4 decimal places
        const ratio = Math.round((discount / suggestedTotal) * 10000) / 10000;

        // Step 3: Multiply by 100 to get percentage
        const percentage = ratio * 100;

        // Step 4: Round to 2 decimal places (matching database precision=5, scale=2)
        return Math.round(percentage * 100) / 100;
    };

    /**
     * Calculates final price from discount percentage exactly as backend does
     */
    const calculateFinalPriceFromDiscountExact = (suggestedTotal: number, discountPercentage: number): number => {
        // First round the discount percentage to 2 decimal places (as it would be in database)
        const roundedDiscount = Math.round(discountPercentage * 100) / 100;

        // Calculate discount amount with 2 decimal places (matching backend calculateDiscountAmount)
        const discountAmount = Math.round((suggestedTotal * roundedDiscount / 100) * 100) / 100;

        // Calculate final price
        const finalPrice = suggestedTotal - discountAmount;

        return Math.max(0.01, finalPrice);
    };

    const handleFinalPriceChange = (value: number) => {
        // Prevent infinite loop if we're already updating from discount
        if (isUpdatingFromDiscount) return;

        // Round to 2 decimal places immediately
        const roundedValue = Math.round(value * 100) / 100;

        // Prevent negative final prices
        const validValue = Math.max(0.01, roundedValue);

        setIsUpdatingFromPrice(true);

        // Calculate discount percentage based on final price
        const discountPercentage = calculateDiscountPercentageExact(suggestedTotal, validValue);

        onFinalPriceChange(validValue);
        onDiscountPercentageChange(discountPercentage);

        setTimeout(() => setIsUpdatingFromPrice(false), 100);
    };

    const handleDiscountPercentageChange = (percentage: number) => {
        // Prevent infinite loop if we're already updating from price
        if (isUpdatingFromPrice) return;

        const roundedPercentage = Math.round(percentage * 100) / 100;

        setIsUpdatingFromDiscount(true);

        // Calculate final price, ensuring it's not negative
        const finalPrice = calculateFinalPriceFromDiscountExact(suggestedTotal, roundedPercentage);

        // If the calculated final price would be too low, adjust the discount
        if (finalPrice <= 0.01) {
            const maxValidDiscount = calculateDiscountPercentageExact(suggestedTotal, 0.01);
            onDiscountPercentageChange(maxValidDiscount);
            onFinalPriceChange(0.01);
        } else {
            onDiscountPercentageChange(percentage);
            onFinalPriceChange(finalPrice);
        }

        setTimeout(() => setIsUpdatingFromDiscount(false), 100);
    };

    return (
        <div className="space-y-6 p-2 min-w-0 min-h-0">
            {/* Summary Information */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{cartItemsCount}</p>
                        <p className="text-sm text-gray-600">Προϊόντα</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatMoney(pricing.subtotal)}</p>
                        <p className="text-sm text-gray-600">Υποσύνολο</p>
                    </div>
                </div>

                {/* Packaging Cost */}
                {pricing.packagingCost > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Κόστος Συσκευασίας:</span>
                            <span className="font-semibold">{formatMoney(pricing.packagingCost)}</span>
                        </div>
                    </div>
                )}

                {/* Suggested Total */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Προτεινόμενο Σύνολο:</span>
                        <span className="text-xl font-bold text-gray-900">{formatMoney(suggestedTotal)}</span>
                    </div>
                </div>
            </div>

            {/* Discount Controls */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Εκπτώσεις</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Discount Percentage Input */}
                    <div className="min-w-0">
                        <CustomNumberInput
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
                            autoRoundDecimals={true}
                        />
                    </div>

                    {/* Final Price Input */}
                    <div className="min-w-0">
                        <CustomNumberInput
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
                            autoRoundDecimals={true}
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

            {/* Final Total */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-900">Τελική Τιμή:</span>
                    <span className="text-3xl font-bold text-blue-600">
                        {formatMoney(pricing.finalPrice)}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Προϊόντα στην πώληση:</h4>
                <div className="space-y-3">
                    {pricing.calculatedItems.map((item) => (
                        <div key={item.productId} className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {/* Product Name and Quantity - Full width */}
                            <div className="font-medium text-gray-900 break-words"> {/* FIXED: Added break-words */}
                                {item.productName} <span className="text-gray-600">(x{item.quantity})</span>
                            </div>

                            {/* Prices - Mobile-friendly layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between sm:block">
                                    <span className="text-gray-600">Αρχική:</span>
                                    <span className="font-semibold text-gray-900">{formatMoney(item.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between sm:block">
                                    <span className="text-gray-600">Τελική:</span>
                                    <span className="font-semibold text-green-600">
                                        {formatMoney((item.totalPrice) - (item.totalPrice * pricing.discountPercentage / 100))}
                                    </span>
                                </div>
                            </div>
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