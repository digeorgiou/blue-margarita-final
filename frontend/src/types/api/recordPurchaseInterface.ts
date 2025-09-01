export interface RecordPurchaseRequestDTO {
    supplierId: number;
    purchaseDate: string;
    materials: PurchaseMaterialRequestDTO[];
}

export interface PurchaseMaterialRequestDTO {
    materialId: number;
    quantity: number;
    pricePerUnit: number;
}



