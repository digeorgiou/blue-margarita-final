import {PurchaseMaterialDetailDTO} from "./recordPurchaseInterface.ts";

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