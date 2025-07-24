import {ProductUsageDTO, CategoryUsageDTO} from "./materialInterface.ts";

export interface ProcedureReadOnlyDTO {
    procedureId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;
}

export interface ProcedureInsertDTO {
    name: string;
    creatorUserId: number;
}

export interface ProcedureUpdateDTO {
    procedureId: number;
    updaterUserId: number;
    name: string;
}

export interface ProcedureForDropdownDTO {
    id: number;
    name: string;
}

export interface ProcedureDetailedViewDTO {
    // Basic procedure information
    procedureId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;

    // Essential analytics
    totalProductsUsing: number;
    averageProcedureCost: number;
    averageProductSellingPriceRetail: number;

    // All-time sales performance (from products using this procedure)
    totalSalesCount: number;
    totalRevenue: number;
    lastSaleDate: string;

    // Recent performance (last 30 days)
    recentSalesCount: number;
    recentRevenue: number;

    // Yearly performance (current year)
    yearlySalesCount: number;
    yearlySalesRevenue: number;

    categoryDistribution: CategoryUsageDTO[];
    topProductsUsage: ProductUsageDTO[];
}
