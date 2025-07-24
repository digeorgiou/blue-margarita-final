import {LocationForDropdownDTO} from "./locationInterface.ts";
import {CategoryForDropdownDTO} from "./categoryInterface.ts";
import {CustomerSearchResultDTO} from "./customerInterface.ts";

export interface RecordPageDataDTO {
    paymentMethods : PaymentMethodDTO[];
    locations : LocationForDropdownDTO[];
    categories : CategoryForDropdownDTO
}

export interface RecordSaleRequestDTO {
    customerId?: number;
    locationId?: number;
    paymentMethod : string;
    isWholesale : boolean;
    packagingCost : number;
    finalPrice : number;
    saleDate : string;
    items : SaleItemRequestDTO[];
    creatorUserId : number;
}

export interface SaleDetailedViewDTO {
    saleId : number;
    saleDate : string;
    customer? : CustomerSearchResultDTO;
    location : LocationForDropdownDTO;
    paymentMethod : string;
    subtotal : number;
    packagingCost : number;
    suggestedTotal : number;
    finalTotal : number;
    discountAmount : number;
    discountPercentage : number;
    items : SaleItemDetailsDTO[];
    isWholesale : boolean;
    totalItemCount : number;
    averageItemPrice : number;
}

export interface SaleItemDetailsDTO{
    productId : number;
    productName : string;
    productCode : string;
    categoryName : string;
    quantity : number;
    priceAtTime : number;
    originalPrice : number;
    totalPrice : number;
    totalDiscount : number;
}

export interface ProductSearchResultDTO {
    id: number;
    name: string;
    code: string;
    categoryName: string;
}

export interface CartItemDTO {
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    suggestedPrice: number;
    totalPrice: number;
}

export interface PriceCalculationRequestDTO {
    items : SaleItemRequestDTO[];
    isWholesale : boolean;
    packagingCost : number;
    userFinalPrice : number;
    userDiscountPercentage : number;
}

export interface PriceCalculationResponseDTO {
    subtotal : number;
    packagingCost : number;
    suggestedTotal : number;
    finalPrice : number;
    discountAmount : number;
    discountPercentage : number;
    calculatedItems : CartItemDTO[];
}

export interface SaleItemRequestDTO {
    productId : number;
    quantity : number;
}

export interface PaymentMethodDTO {
    value : string;
    displayName : string;
}