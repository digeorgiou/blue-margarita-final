import {ProductStatsSummaryDTO} from "./dashboardInterface.ts";

export interface CustomerListItemDTO {
    customerId: number;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    address: string;
    email: string;
    tin: string;
    gender: GenderType;
}

export interface CustomerInsertDTO {
    firstname: string;
    lastname: string;
    gender: GenderType;
    phoneNumber: string | null;
    address: string | null;
    email: string | null;
    tin: string | null;
    creatorUserId: number;
}

export interface CustomerUpdateDTO {
    customerId: number;
    updaterUserId: number;
    firstname: string;
    lastname: string;
    gender: GenderType;
    phoneNumber: string;
    address: string;
    email: string;
    tin: string;
}

export interface CustomerSearchResultDTO {
    id: number;
    fullName: string;
    email: string;
}

export interface CustomerDetailedViewDTO {
    customerId: number;
    firstname: string;
    lastname: string;
    fullName: string;
    gender: GenderType;
    phoneNumber: string;
    address: string;
    email: string;
    tin: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;
    firstSaleDate: string;

    // All-time statistics
    totalRevenue: number;
    totalSalesCount: number;
    averageOrderValue: number;
    lastOrderDate: string;

    // Recent performance (last 30 days)
    recentSalesCount: number;
    recentRevenue: number;

    // Yearly performance (current year)
    yearlySalesCount: number;
    yearlySalesRevenue: number;

    // Top products by revenue for Customer
    topProducts: ProductStatsSummaryDTO[];
}

export enum GenderType {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

export const GenderTypeLabels: Record<GenderType, string> = {
    [GenderType.MALE]: "Άνδρας",
    [GenderType.FEMALE]: "Γυναίκα",
    [GenderType.OTHER]: "Άλλο"
};

export const getGenderTypeLabel = (type: GenderType): string => {
    return GenderTypeLabels[type];
};

export interface Paginated<T> {
    data: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    numberOfElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
