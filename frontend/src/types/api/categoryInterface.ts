import {ProductStatsSummaryDTO} from "./dashboardInterface";

export interface CategoryReadOnlyDTO {
    categoryId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;

    [key: string]: unknown;
}

export interface CategoryInsertDTO {
    name : string;
    creatorUserId: number;
}

export interface CategoryUpdateDTO {
    categoryId: number;
    updaterUserId: number;
    name: string;
}

export interface CategoryForDropdownDTO {
    id: number;
    name: string;
}

export interface CategoryDetailedViewDTO {
    // Basic category information
    categoryId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;

    // Product usage statistics
    totalProductsInCategory: number;
    averageProductPrice: number;

    // All-time sales statistics
    totalRevenue: number;
    totalSalesCount: number;
    averageOrderValue: number;
    lastSaleDate: string;

    // Recent performance (last 30 days)
    recentSalesCount: number;
    recentRevenue: number;

    // Yearly performance (current year)
    yearlySalesCount: number;
    yearlySalesRevenue: number;

    // Top performing products in this category
    topProducts: ProductStatsSummaryDTO[];
}

export interface Paginated<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
