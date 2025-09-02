import {SaleProductDTO, SalesSummaryDTO} from "./dashboardInterface.ts";
import { PaymentMethod } from "./dashboardInterface.ts";
import { CustomerSearchResultDTO } from "./customerInterface.ts";
import { LocationForDropdownDTO } from "./locationInterface.ts";

export interface SaleReadOnlyDTO {
    id: number;
    customerName: string;
    locationName: string;
    saleDate: string;
    isWholesale: boolean;
    suggestedTotalPrice: number;
    finalTotalPrice: number;
    discountPercentage: number;
    discountAmount: number;
    packagingPrice: number;
    subTotal: number;
    paymentMethod: string;
    productCount: number;
    products: SaleProductDTO[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
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

export interface SaleUpdateDTO {
    saleId: number;
    customerId: number | null;
    locationId: number;
    saleDate: string;
    finalTotalPrice: number;
    packagingPrice: number;
    paymentMethod: string;
}

export interface PaginatedFilteredSalesWithSummary {
    data: SaleReadOnlyDTO[];
    totalElements: number;
    numberOfElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    summary: SalesSummaryDTO;
}

export interface SaleFilters {
    customerId?: number;
    productId?: number;
    locationId?: number;
    categoryId?: number;
    saleDateFrom?: string; // ISO date string
    saleDateTo?: string; // ISO date string
    paymentMethod?: PaymentMethod;
    isWholesale?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
}