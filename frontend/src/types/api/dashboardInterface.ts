export interface DashboardOverviewDTO {
    weeklySales: SalesSummaryDTO;
    monthlySales: SalesSummaryDTO;
    recentSales: SaleListItemDTO[];
    recentPurchases: PurchaseReadOnlyDTO[];
    lowStockProducts: ProductListItemDTO[];
    topProductsThisMonth: ProductListItemDTO[];
    dashboardTasks: DashboardToDoTasksDTO;
    stockAlerts: StockAlertDTO[];
    mispricedProductAlerts: MispricedProductAlertDTO[];
}

export interface SaleListItemDTO {
    id: number;
    saleDate: string;
    customerName: string;
    totalAmount: number;
    // Add other fields based on your DTO
}

export interface SalesSummaryDTO {
    count: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDiscount: number;
    averageDiscount: number;
}

export interface PurchaseReadOnlyDTO {
    id: number;
    purchaseDate: string;
    supplierName: string;
    totalCost: number;
    // Add other fields based on your DTO
}

export interface ProductListItemDTO {
    id: number;
    name: string;
    description: string;
    currentStock: number;
    price: number;
    // Add other fields based on your DTO
}

export interface DashboardToDoTasksDTO {
    overdueAndTodayTasks: ToDoTaskReadOnlyDTO[];
    thisWeekTasks: ToDoTaskReadOnlyDTO[];
    summary: ToDoTaskSummaryDTO;
    hasMoreOverdueAndToday: boolean;
    hasMoreThisWeek: boolean;
}

export interface ToDoTaskReadOnlyDTO {
    id: number;
    description: string;
    date: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    // Add other fields based on your DTO
}

export interface ToDoTaskSummaryDTO {
    overdueTasks: number;
    todayTasks: number;
    thisWeekTasks: number;
    totalPendingTasks: number;
}

export interface StockAlertDTO {
    productId: number;
    productName: string;
    currentStock: number;
    minStockLevel: number;
    // Add other fields
}

export interface MispricedProductAlertDTO {
    productId: number;
    productName: string;
    currentPrice: number;
    suggestedPrice: number;
    // Add other fields
}

export interface ToDoTaskInsertDTO {
    description: string;
    date: string;
}

export interface ToDoTaskUpdateDTO {
    id: number;
    description?: string;
    date?: string;
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
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