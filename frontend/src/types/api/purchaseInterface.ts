import {PurchaseMaterialDTO} from "./dashboardInterface.ts";

export interface PurchaseDetailedViewDTO {
    purchaseId: number;
    purchaseDate: string;
    supplierName: string;
    supplierTin?: string;
    supplierPhoneNumber?: string;
    supplierEmail?: string;
    totalCost: number;
    totalItemCount: number;
    materials: PurchaseMaterialDetailDTO[];
    createdAt: string;
    createdBy: string;
}

export interface PurchaseMaterialDetailDTO {
    materialId: number;
    materialName: string;
    unitOfMeasure: string;
    quantity: number;
    priceAtTheTime: number;
    currentUnitCost: number;
    lineTotal: number;
    costDifference: number; // priceAtTheTime - currentUnitCost
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
    totalPurchasesCount: number;
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