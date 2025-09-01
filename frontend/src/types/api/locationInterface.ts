import {ProductStatsSummaryDTO} from "./dashboardInterface.ts";

export interface LocationReadOnlyDTO {
    locationId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;
}

export interface LocationInsertDTO{
    name: string;
}

export interface LocationUpdateDTO {
    locationId: number;
    name: string;
}

export interface LocationForDropdownDTO {
    id: number;
    name: string;
}

export interface LocationDetailedViewDTO {
    // Basic location information
    locationId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;

    // Essential sales statistics only
    totalRevenue: number;
    totalSalesCount: number;
    averageOrderValue: number;
    lastSaleDate: string;

    // Simple recent performance (last 30 days)
    recentSalesCount: number;
    recentRevenue: number;

    // Simple yearly performance (current year)
    yearlySalesCount: number;
    yearlySalesRevenue: number;

    topProducts: ProductStatsSummaryDTO[];
}
