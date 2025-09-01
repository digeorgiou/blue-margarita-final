export interface ProductListItemDTO {
id: string;
name: string;
code: string;
categoryName: string;
minutesToMake: number;
totalCost: number;
suggestedRetailPrice: number;
finalRetailPrice: number;
percentageDifference: number;
isActive: boolean;
isLowStock: boolean;
currentStock: number;
lowStockAlert: number;
}

export interface ProductInsertDTO {
    name: string;
    code: string;
    categoryId: number;
    finalSellingPriceRetail?: number;
    finalSellingPriceWholesale?: number;
    minutesToMake?: number;
    stock?: number;
    lowStockAlert?: number;
    materials?: { [materialId: number]: number }; // Material ID -> Quantity
    procedures?: { [procedureId: number]: number }; // Procedure ID -> Cost
}

export interface ProductUpdateDTO{
    productId: number;
    name: string;
    code: string;
    categoryId: number;
    finalSellingPriceRetail: number;
    finalSellingPriceWholesale: number;
    minutesToMake: number;
    stock: number;
    lowStockAlert: number;
}

export interface ProductDetailedViewDTO{
    id: number;
    name: string;
    code: string;
    categoryName: string;
    categoryId: number;
    suggestedRetailPrice: number;
    suggestedWholesalePrice: number;
    finalRetailPrice: number;
    finalWholesalePrice: number;
    percentageDifferenceRetail: number;
    percentageDifferenceWholesale: number;
    minutesToMake: number;
    totalCost: number;
    materialCost: number;
    laborCost: number;
    procedureCost: number;
    currentStock: number;
    lowStockAlert: number;
    isLowStock: boolean;
    materials: ProductMaterialDetailDTO[];
    procedures:ProductProcedureDetailDTO[];
    profitMarginRetail: number;
    profitMarginWholesale: number;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    createdBy: number;
    lastUpdatedBy: number;

}

export interface ProductMaterialDetailDTO {
    materialId: number;
    materialName: string;
    quantity: number;
    unitOfMeasure: string;
    unitCost: number;
    totalCost: number;
}

export interface ProductProcedureDetailDTO{
    procedureId: number;
    procedureName: string;
    cost: number;
}

export interface ProductSearchResultDTO{
    id: number;
    name: string;
    code: string;
    categoryName: string;
}

export interface ProductSalesAnalyticsDTO{
    productId: number;
    productName: string;
    productCode: string;
    periodStart: string;
    periodEnd: string;
    totalQuantitySold: number;
    totalRevenue: number;
    numberOfSales: number;
    averageQuantityPerSale: number;
    averageRevenuePerSale: number;
    averageSellingPrice: number;

    weeklySalesData : WeeklySalesDataDTO;
    monthlySalesData : MonthlySalesDataDTO;
    yearlySalesData : YearlySalesDataDTO;

    topLocationsByRevenue: LocationSalesDataDTO[];
    topCustomersByQuantity: CustomerSalesDataDTO[];

    lastSaleDate: string;
    currentStock: number;
    isActive: boolean;
}

interface WeeklySalesDataDTO {
    year: number;
    weekOfYear: number;
    quantitySold: number;
    revenue: number;
}

interface MonthlySalesDataDTO {
    year: number;
    month: number;
    quantitySold: number;
    revenue: number;
}

interface YearlySalesDataDTO {
    year: number;
    quantitySold: number;
    revenue: number;
}

interface LocationSalesDataDTO {
    locationId: number;
    locationName: string;
    quantitySold: number;
    revenue: number;
    numberOfSales: number;
    averagePrice: number;
}

interface CustomerSalesDataDTO {
    customerId: number;
    customerName: string;
    customerEmail: string;
    quantityPurchased: number;
    totalRevenue: number;
    numberOfSales: number;
    averagePrice: number;
    lastOrderDate: string;
}

export interface ProductStatsSummaryDTO{
    productId: number;
    productName: string;
    productCode: string;
    totalItemsSold: number;
    totalRevenue: number;
    lastSaleDate: string;
}

export interface PriceRecalculationResultDTO {
    totalProductsProcessed: number;
    productsUpdated: number;
    productsSkipped: number;
    productsFailed: number;
    processedAt: string;
    processedByUsername: string;
    failedProductCodes: string[];
}

export class PriceRecalculationUtils {
    static getSuccessRate(result: PriceRecalculationResultDTO): number {
        if (result.totalProductsProcessed === 0) return 0.0;
        return (result.productsUpdated / result.totalProductsProcessed) * 100;
    }

    static isCompletelySuccessful(result: PriceRecalculationResultDTO): boolean {
        return result.productsFailed === 0 && result.totalProductsProcessed > 0;
    }

    static formatProcessedAt(result: PriceRecalculationResultDTO): string {
        return new Date(result.processedAt).toLocaleString('el-GR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}