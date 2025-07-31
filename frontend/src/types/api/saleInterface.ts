import {SaleProductDTO, SalesSummaryDTO} from "./dashboardInterface.ts";

export interface SaleReadOnlyDTO {
    id: number;
    customerName: string;
    locationName: string;
    saleDate: string;
    suggestedTotalPrice: number;
    finalTotalPrice: number;
    discountPercentage: number;
    discountAmount: number;
    packagingPrice: number;
    grandTotal: number;
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