import {PaymentMethod, PurchaseMaterialDTO} from "./dashboardInterface.ts";

export interface PurchaseDetailedViewDTO {
    purchaseId: number;
    purchaseDate: string;
    supplierName: string;
    supplierContact: string;
    totalCost: number;
    totalItemCount: number;
    materials: PurchaseMaterialDetailDTO[];
    createdAt: string;
    createdBy: string;
    notes?: string;
}

export interface PurchaseReadOnlyDTO {
    id: number;
    supplierName: string;
    purchaseDate: string;
    totalCost: number;
    itemCount: number;
    materials: PurchaseMaterialDTO[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
}

export interface PurchaseUpdateDTO {
    purchaseId: number;
    supplierId: number;
    purchaseDate: string;
    updaterUserId: number;
}

export interface PaginatedFilteredPurchasesWithSummary{
    data: PurchaseReadOnlyDTO[];
    totalElements: number;
    numberOfElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    summary: PurchaseSummaryDTO;
}

export interface PurchaseSummaryDTO {
    totalPurchaseCount: number;
    totalAmountSpent: number;
}

export interface PurchaseFilters {
    supplierId?: number;
    purchaseDateFrom?: string; // ISO date string
    purchaseDateTo?: string; // ISO date string
    materialId?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
}