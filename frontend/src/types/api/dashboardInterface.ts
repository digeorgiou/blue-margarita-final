export interface DashboardOverviewDTO {
    weeklySales: SalesSummaryDTO;
    monthlySales: SalesSummaryDTO;
    recentSales: SaleReadOnlyDTO[];
    recentPurchases: PurchaseReadOnlyDTO[];
    lowStockProducts: StockAlertDTO[];
    topProductsThisMonth: ProductStatsSummaryDTO[];
    dashboardTasks: DashboardToDoTasksDTO;
    mispricedProducts: MispricedProductAlertDTO[];
}

export interface SaleReadOnlyDTO {
    id : number;
    customerName : string;
    locationName : string;
    saleDate : string;
    suggestedTotalPrice : number;
    finalTotalPrice : number ;
    discountPercentage : number;
    discountAmount : number;
    packagingPrice : number;
    subTotal : number;
    paymentMethod : PaymentMethod;
    productCount : number;
    products : SaleProductDTO[];
    createdAt : string;
    updatedAt : string;
    createdBy : string;
    lastUpdatedBy : string;
}

export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    OTHER = "OTHER"
}

export const PaymentMethodLabels : Record<PaymentMethod, string> = {
    [PaymentMethod.CASH] : "Μετρητά",
    [PaymentMethod.CARD] : "Κάρτα",
    [PaymentMethod.BANK_TRANSFER] : "Τραπεζική κατάθεση",
    [PaymentMethod.OTHER] : "Άλλο"
}

export  const getPaymentMethodLabel = (type : PaymentMethod) : string => {
    return PaymentMethodLabels[type];
}

export interface SalesSummaryDTO {
    totalSalesCount : number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDiscountAmount: number;
    averageDiscountPercentage: number;
}

export interface SaleProductDTO {
    productId : number;
    productName : string;
    productCode : string;
    quantity : number;
    suggestedUnitPrice : number;
    actualUnitPrice : number;
    suggestedTotal : number;
    actualTotal : number;
    discountAmount : number;
}

export interface PurchaseReadOnlyDTO {
    id : number;
    supplierName : string;
    purchaseDate : string;
    totalCost : number;
    itemCount : number;
    materials : PurchaseMaterialDTO[];
    createdAt : string;
    updatedAt : string;
    createdBy : string;
    lastUpdatedBy : string;
}

export interface PurchaseMaterialDTO {
    materialId : number;
    materialName : string;
    quantity : number;
    unitOfMeasure : string;
    priceAtTheTime : number;
    lineTotal : number;
}

export interface ProductListItemDTO {
    id: number;
    name: string;
    description: string;
    currentStock: number;
    price: number;
    // Add other fields based on your DTO
}

export interface BaseProduct {
    productId : number;
    productName : string;
    productCode : string;
}

export interface ProductStatsSummaryDTO extends BaseProduct{
    totalItemsSold : number;
    totalRevenue : number;
    lastSaleDate: string;
}

export interface StockAlertDTO extends BaseProduct {
    currentStock : number;
    lowStockThreshold : number;
    stockStatus : string;
}

export interface DashboardToDoTasksDTO {
    overdueAndTodayTasks: ToDoTaskReadOnlyDTO[];
    thisWeekTasks: ToDoTaskReadOnlyDTO[];
    summary: ToDoTaskSummaryDTO;
    displayLimit : number;
    hasMoreTasks: boolean;
}

export interface ToDoTaskReadOnlyDTO {
    id: number;
    description: string;
    date: string;
    dateCompleted: string;
    status: string;
    statusLabel: string;
    daysFromToday: number;
}

export interface ToDoTaskSummaryDTO {
    overdueCount: number;
    todayCount: number;
    thisWeekCount: number;
    totalPendingCount: number;
}

export interface MispricedProductAlertDTO {
    productId : number;
    productName : string;
    productCode : string;
    categoryId : number;
    categoryName: string;
    suggestedRetailPrice: number;
    finalRetailPrice: number;
    priceDifferencePercentage: number;
    suggestedWholesalePrice: number;
    finalWholesalePrice: number;
    wholesalePriceDifferencePercentage: number;
    issueType: string;
}

export interface ToDoTaskInsertDTO {
    description: string;
    date: string;
}

export interface ToDoTaskUpdateDTO {
    taskId: number;
    description?: string;
    date?: string;
}

export interface Paginated<T> {
    data: T[];
    totalElements: number;      //total count across all pages
    numberOfElements: number;   //count in current page
    totalPages: number;
    currentPage: number;
    pageSize: number;
}