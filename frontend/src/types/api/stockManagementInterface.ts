export interface StockUpdateResultDTO {
    productId : number;
    productCode : string;
    previousStockId : number;
    newStock : number;
    changeAmount : number;
    success : boolean;
    operationType : string;
    updatedAt : string;
}

export interface StockLimitUpdateResultDTO {
    productId : number;
    productCode : string;
    previousStockLimit : number;
    newStockLimit : number;
    changeAmount : number;
    success : boolean;
    updatedAt : string;
}

export interface StockManagementDTO {
    productId: number;
    productName: string;
    productCode: string;
    categoryName: string;
    currentStock: number;
    lowStockAlert: number;
    isActive: boolean;
    unitSellingPrice: number;
    totalStockValue: number;
    status: StockStatus; // NORMAL, LOW, NEGATIVE, NO_ALERT
}

export type StockStatus = 'NORMAL' | 'LOW' | 'NEGATIVE';

export type StockUpdateType = 'ADD' | 'REMOVE' | 'SET';

export interface StockUpdateDTO {
    productId: number;
    updateType: StockUpdateType;
    quantity: number;
}

export interface StockLimitUpdateDTO {
    productId: number;
    quantity: number;
}

export interface StockAlertDTO {
    productId: number;
    productCode: string;
    productName: string;
    currentStock: number;
    lowStockThreshold: number;
    stockStatus: string; // LOW, NEGATIVE, NORMAL
}

export interface StockManagementFilters {
    nameOrCode?: string;
    categoryId?: number;
    lowStock?: boolean;
    minStock?: number;
    maxStock?: number;
    status?: StockStatus;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}