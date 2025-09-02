import {CartItemDTO, PriceCalculationResponseDTO} from "../api/recordSaleInterface.ts";

export type CartItemProps = {
    item: CartItemDTO;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
    formatMoney: (amount: number) => string;
}

export type CartSummaryProps = {
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