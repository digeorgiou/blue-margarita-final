import {SaleProductDTO, SalesSummaryDTO} from "./dashboardInterface.ts";
import { PaymentMethod } from "./dashboardInterface.ts";

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

export interface SaleUpdateDTO {
    saleId: number;
    customerId: number;
    locationId: number;
    saleDate: string;
    finalTotalPrice: number;
    packagingPrice: number;
    paymentMethod: string;
    updaterUserId: number;
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