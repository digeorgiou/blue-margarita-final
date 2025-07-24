export interface RecordPurchaseRequestDTO {
    supplierId: number;
    purchaseDate: string;
    creatorUserId?: number;
    materials: PurchaseMaterialRequestDTO[];
}

export interface PurchaseMaterialRequestDTO {
    materialId: number;
    quantity: number;
    pricePerUnit: number;
}



