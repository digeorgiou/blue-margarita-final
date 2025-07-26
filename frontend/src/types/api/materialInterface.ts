export interface MaterialReadOnlyDTO {
    materialId: number;
    name: string;
    currentUnitCost: number;
    unitOfMeasure: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;
}

export interface MaterialInsertDTO {
    name: string;
    currentUnitCost: number;
    unitOfMeasure: string;
    creatorUserId: number;
}

export interface MaterialUpdateDTO {
    materialId: number;
    updaterUserId: number;
    name: string;
    currentUnitCost: number;
    unitOfMeasure: string;
}

export interface MaterialSearchResultDTO {
    materialId: number;
    materialName: string;
    unitOfMeasure: string;
    currentUnitCost: number;
}

export interface MaterialDetailedViewDTO {
    // Basic material information
    id: number;
    name: string;
    unit: string;
    costPerUnit: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastUpdatedBy: string;
    isActive: boolean;
    deletedAt: string;

    // Usage statistics
    totalProductsUsing: number;
    averageCostPerProduct: number;

    // Purchase analytics
    purchaseCount: number;
    lastPurchaseDate: string;
    recentPurchaseQuantity: number;     // last 30 days
    yearlyPurchaseQuantity: number;     // current year
    thisYearAveragePurchasePrice: number;
    lastYearAveragePurchasePrice: number | null; // null if no purchases last year

    // All-time sales performance (from products using this material)
    totalRevenue: number;
    totalSalesCount: number;
    lastSaleDate: string;

    // Recent performance (last 30 days)
    recentSalesCount: number;
    recentRevenue: number;

    // Yearly performance (current year)
    yearlySalesCount: number;
    yearlySalesRevenue: number;

    // Category distribution
    categoryDistribution: CategoryUsageDTO[];

    // Product usage distribution (top 10 products using this material)
    topProductsUsage: ProductUsageDTO[];
}

export interface CategoryUsageDTO {
    categoryId: number;
    categoryName: string;
    productCount: number;
    percentage: number;
}

export interface ProductUsageDTO {
    productId: number;
    productName: string;
    productCode: string;
    usageQuantity: number;
    costImpact: number;
    categoryName: string;
}

export interface PriceRecalculationResultDT {
    totalProductsProcessed: number;
    productsUpdated: number;
    productsSkipped: number;
    productsFailed: number;
    processedAt: string;
    processedByUsername: string;
    failedProductCodes: string[];
}