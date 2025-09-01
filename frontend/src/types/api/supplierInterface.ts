export interface SupplierSearchResultDTO {
    supplierId: number;
    supplierName: string;
    supplierTin?: string;
    email?: string;
    phoneNumber?: string;
}

export interface SupplierInsertDTO {
    name: string;
    address: string;
    tin: string;
    phoneNumber: string;
    email: string;
}

export interface SupplierReadOnlyDTO {
    supplierId: number;
    name: string;
    address: string;
    tin: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;
}

export interface SupplierUpdateDTO {
    supplierId: number;
    name: string;
    address: string;
    tin: string;
    phoneNumber: string;
    email: string;
}

export interface SupplierDetailedViewDTO {
    supplierId: number;
    name: string;
    address: string;
    tin: string;
    phoneNumber: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;

    totalPurchases: number;
    totalCostPaid: number;
    lastPurchaseDate: string;
    averagePurchaseValue: number;

    topMaterials: MaterialStatsSummaryDTO[];
}

export interface MaterialStatsSummaryDTO {
    materialId: number;
    materialName: string;
    totalQuantityPurchased: number;
    totalCostPaid: number;
    lastPurchaseDate: string;
}