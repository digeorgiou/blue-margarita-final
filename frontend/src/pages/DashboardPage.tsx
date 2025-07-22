import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import {
    DashboardOverviewDTO,
    ToDoTaskReadOnlyDTO,
    getPaymentMethodLabel,
    getPricingIssueTypeLabel
} from "../types/api/dashboardInterface.ts";
import { Button, Card, ListItem, LoadingSpinner, StatCard, TaskItem, TaskStat, QuickActions } from '../components/ui';

interface DashboardProps {
    onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    // State management
    const [data, setData] = useState<DashboardOverviewDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to format money
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Function to format dates
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR');
    };

    // Function to format task date with status
    const formatTaskDate = (task: ToDoTaskReadOnlyDTO): string => {
        const date = formatDate(task.date);
        if (task.daysFromToday < 0) {
            return `${date} (${Math.abs(task.daysFromToday)} days overdue)`;
        } else if (task.daysFromToday === 0) {
            return `${date} (Today)`;
        } else {
            return `${date} (in ${task.daysFromToday} days)`;
        }
    };

    // Function to load dashboard data
    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const dashboardData = await dashboardService.getDashboardOverview();
            setData(dashboardData);

        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to complete a task
    const completeTask = async (taskId: number) => {
        try {
            await dashboardService.completeTask(taskId);
            loadDashboard(); // Reload to see updated tasks
        } catch (err) {
            console.error('Failed to complete task:', err);
        }
    };

    // Navigation handlers for "View All" buttons
    const handleViewAllLowStock = () => {
        onNavigate('low-stock-products');
    };

    const handleViewAllMispriced = () => {
        onNavigate('mispriced-products');
    };

    const handleViewAllTasks = () => {
        onNavigate('all-tasks');
    };

    // Quick action handlers
    const handleRecordSale = () => {
        onNavigate('record-sale');
    };

    const handleRecordPurchase = () => {
        onNavigate('record-purchase');
    };

    const handleStockManagement = () => {
        onNavigate('stock-management');
    };

    // Load data when component mounts
    useEffect(() => {
        loadDashboard();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <LoadingSpinner />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">😵</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={loadDashboard} variant="primary">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // No data state
    if (!data) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No data available</h2>
                        <Button onClick={loadDashboard} variant="primary">
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Main dashboard render
    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">

                {/* Dashboard Header */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Blue Margarita Dashboard</h1>
                            <p className="text-gray-700 mt-1">Welcome back! Here's what's happening today.</p>
                        </div>
                        <button
                            onClick={loadDashboard}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* THIS IS WHERE QuickActions IS USED! */}
                <QuickActions
                    onRecordSale={handleRecordSale}
                    onRecordPurchase={handleRecordPurchase}
                    onStockManagement={handleStockManagement}
                />

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Sales Summary Card */}
                    <Card title="Sales Summary" icon="💰" className="lg:col-span-1">
                        <div className="grid grid-cols-2 gap-6">
                            <StatCard
                                label="This Week"
                                value={formatMoney(data.weeklySales.totalRevenue)}
                                isBig={true}
                                color="green"
                            />
                            <StatCard
                                label="This Month"
                                value={formatMoney(data.monthlySales.totalRevenue)}
                                color="blue"
                            />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Weekly Sales: </span>
                                    <span className="font-semibold">{data.weeklySales.totalSalesCount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Monthly Sales: </span>
                                    <span className="font-semibold">{data.monthlySales.totalSalesCount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Avg Weekly: </span>
                                    <span className="font-semibold">{formatMoney(data.weeklySales.averageOrderValue)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Avg Monthly: </span>
                                    <span className="font-semibold">{formatMoney(data.monthlySales.averageOrderValue)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tasks Overview Card */}
                    <Card title="Tasks Overview" icon="📋" className="lg:col-span-1">
                        <div className="grid grid-cols-3 gap-3">
                            <TaskStat
                                number={data.dashboardTasks.summary.overdueCount}
                                label="Overdue"
                                color="red"
                            />
                            <TaskStat
                                number={data.dashboardTasks.summary.todayCount}
                                label="Today"
                                color="yellow"
                            />
                            <TaskStat
                                number={data.dashboardTasks.summary.totalPendingCount}
                                label="Total"
                                color="blue"
                            />
                        </div>
                    </Card>

                    {/* Top Products This Month */}
                    <Card title="Top Products This Month" icon="🏆" className="lg:col-span-1">
                        <div className="space-y-3">
                            {data.topProductsThisMonth.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p className="text-gray-500 italic">No sales data available</p>
                                </div>
                            ) : (
                                data.topProductsThisMonth.slice(0, 5).map((product) => (
                                    <ListItem
                                        key={product.productId}
                                        primaryText={product.productName}
                                        secondaryText={`Code: ${product.productCode} | Sold: ${product.totalItemsSold} units`}
                                        rightText={formatMoney(product.totalRevenue)}
                                        rightTextColor="green"
                                    />
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Recent Sales Card */}
                    <Card title="Recent Sales" icon="🛒" className="lg:col-span-1 xl:col-span-1">
                        <div className="space-y-3">
                            {data.recentSales.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🛍️</div>
                                    <p className="text-gray-500 italic">No recent sales</p>
                                </div>
                            ) : (
                                data.recentSales.slice(0, 5).map((sale) => (
                                    <ListItem
                                        key={sale.id}
                                        primaryText={sale.customerName}
                                        secondaryText={`${formatDate(sale.saleDate)} | ${getPaymentMethodLabel(sale.paymentMethod)} | ${sale.productCount} items`}
                                        rightText={formatMoney(sale.grandTotal)}
                                        rightTextColor="green"
                                    />
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Recent Purchases Card */}
                    <Card title="Recent Purchases" icon="📦" className="lg:col-span-1">
                        <div className="space-y-3">
                            {data.recentPurchases.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p className="text-gray-500 italic">No recent purchases</p>
                                </div>
                            ) : (
                                data.recentPurchases.slice(0, 5).map((purchase) => (
                                    <ListItem
                                        key={purchase.id}
                                        primaryText={purchase.supplierName}
                                        secondaryText={`${formatDate(purchase.purchaseDate)} | ${purchase.itemCount} items`}
                                        rightText={formatMoney(purchase.totalCost)}
                                        rightTextColor="red"
                                    />
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Active Tasks Card */}
                    <Card title="Active Tasks" icon="✅" className="lg:col-span-1">
                        <div className="space-y-3">
                            {data.dashboardTasks.overdueAndTodayTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">✨</div>
                                    <p className="text-gray-500 italic">No active tasks</p>
                                </div>
                            ) : (
                                data.dashboardTasks.overdueAndTodayTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={{
                                            id: task.id,
                                            description: task.description,
                                            date: formatTaskDate(task),
                                            status: task.status
                                        }}
                                        onComplete={completeTask}
                                    />
                                ))
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Button variant="secondary" size="sm">
                                ➕ Add New Task
                            </Button>
                        </div>
                        {(data.dashboardTasks.overdueAndTodayTasks.length > 0 || data.dashboardTasks.hasMoreTasks) && (
                            <Button variant="secondary" size="sm" onClick={handleViewAllTasks}>
                                📋 View All Tasks
                            </Button>
                        )}
                    </Card>

                    {/* Low Stock Alert Card */}
                    <Card title="Low Stock Alert" icon="⚠️" className="lg:col-span-2 xl:col-span-1">
                        <div className="space-y-3">
                            {data.lowStockProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">✅</div>
                                    <p className="text-gray-500 italic">All products well stocked</p>
                                </div>
                            ) : (
                                data.lowStockProducts.map((product) => (
                                    <ListItem
                                        key={product.productId}
                                        primaryText={product.productName}
                                        secondaryText={`Code: ${product.productCode} | Stock: ${product.currentStock} | Min: ${product.lowStockThreshold}`}
                                        rightText={product.stockStatus}
                                        rightTextColor="red"
                                        isWarning={true}
                                    />
                                ))
                            )}
                        </div>
                        {data.lowStockProducts.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button variant="secondary" size="sm" onClick={handleViewAllLowStock}>
                                    📋 View All Low Stock Products
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Mispriced Products Alert Card */}
                    <Card title="Mispriced Products" icon="💸" className="lg:col-span-2 xl:col-span-1">
                        <div className="space-y-3">
                            {data.mispricedProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">💰</div>
                                    <p className="text-gray-500 italic">All prices are optimal</p>
                                </div>
                            ) : (
                                data.mispricedProducts.map((product) => {
                                    // Determine which price to show based on issue type
                                    const showRetailPrice = product.issueType === 'RETAIL_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED';
                                    const showWholesalePrice = product.issueType === 'WHOLESALE_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED';

                                    let priceDetails = '';
                                    if (showRetailPrice && showWholesalePrice) {
                                        priceDetails = `Retail: ${formatMoney(product.suggestedRetailPrice)} → ${formatMoney(product.finalRetailPrice)} | Wholesale: ${formatMoney(product.suggestedWholesalePrice)} → ${formatMoney(product.finalWholesalePrice)}`;
                                    } else if (showRetailPrice) {
                                        priceDetails = `Retail: ${formatMoney(product.suggestedRetailPrice)} → ${formatMoney(product.finalRetailPrice)}`;
                                    } else if (showWholesalePrice) {
                                        priceDetails = `Wholesale: ${formatMoney(product.suggestedWholesalePrice)} → ${formatMoney(product.finalWholesalePrice)}`;
                                    }

                                    return (
                                        <div
                                            key={product.productId}
                                            className="p-3 rounded-lg border-l-4 bg-yellow-50 border-yellow-400"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{product.productName}</p>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        {product.categoryName} | Code: {product.productCode}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">{getPricingIssueTypeLabel(product.issueType)}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {priceDetails}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-600">
                                                        {product.priceDifferencePercentage.toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        underpriced
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {data.mispricedProducts.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button variant="secondary" size="sm" onClick={handleViewAllMispriced}>
                                    💸 View All Mispriced Products
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* This Week Tasks Card */}
                    <Card title="This Week Tasks" icon="📅" className="lg:col-span-2 xl:col-span-1">
                        <div className="space-y-3">
                            {data.dashboardTasks.thisWeekTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🌟</div>
                                    <p className="text-gray-500 italic">No tasks scheduled this week</p>
                                </div>
                            ) : (
                                data.dashboardTasks.thisWeekTasks.slice(0, 5).map((task) => (
                                    <ListItem
                                        key={task.id}
                                        primaryText={task.description}
                                        secondaryText={formatTaskDate(task)}
                                        rightText={task.statusLabel}
                                        rightTextColor={task.status === 'COMPLETED' ? 'green' : 'blue'}
                                    />
                                ))
                            )}
                        </div>
                        {data.dashboardTasks.hasMoreTasks && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button variant="secondary" size="sm">
                                    📋 View All Tasks
                                </Button>
                            </div>
                        )}
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;