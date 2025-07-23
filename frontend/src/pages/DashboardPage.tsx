import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import {
    DashboardOverviewDTO,
    ToDoTaskReadOnlyDTO,
    getPaymentMethodLabel,
} from "../types/api/dashboardInterface.ts";
import { Button, ListItem, LoadingSpinner, StatCard, TaskItem, QuickActions } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import TaskModal from "../components/ui/modals/TaskModal.tsx";

interface DashboardProps {
    onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    // State management
    const [data, setData] = useState<DashboardOverviewDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [taskView, setTaskView] = useState<'active' | 'week'>('active');

    //Modal state
    const[isModalOpen, setIsModalOpen] = useState(false);
    const[modalMode, setModalMode] = useState<'create' | 'update'> ('create');
    const[selectedTask, setSelectedTask] = useState<ToDoTaskReadOnlyDTO | null>(null);

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
            return `${date} (Πριν ${Math.abs(task.daysFromToday)} ημέρες)`;
        } else if (task.daysFromToday === 0) {
            return `${date} (Σήμερα)`;
        } else {
            return `${date} (Σε ${task.daysFromToday} ημέρες)`;
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
            loadDashboard();
        } catch (err) {
            console.error('Failed to complete task:', err);
        }
    };

    const handleAddNewTask = () => {
        setSelectedTask(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleTaskSubmit = async (taskData: { description: string; date: string }) => {
        try {
            await dashboardService.createTask(taskData);
            loadDashboard(); // Refresh the task list
        } catch (err) {
            console.error('Failed to save task:', err);
            alert('Failed to save task. Please try again.');
        }
    };


    // Navigation handlers
    const handleViewAllLowStock = () => onNavigate('low-stock-products');
    const handleViewAllMispriced = () => onNavigate('mispriced-products');
    const handleViewAllTasks = () => onNavigate('all-tasks');
    const handleRecordSale = () => onNavigate('record-sale');
    const handleRecordPurchase = () => onNavigate('record-purchase');
    const handleStockManagement = () => onNavigate('stock-management');

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

    // Task toggle component
    const TaskToggle = () => (
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => setTaskView('active')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    taskView === 'active'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Σήμερα
            </button>
            <button
                onClick={() => setTaskView('week')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    taskView === 'week'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Εβδομάδας
            </button>
        </div>
    );

    // Main dashboard render
    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">

                <QuickActions
                    onRecordSale={handleRecordSale}
                    onRecordPurchase={handleRecordPurchase}
                    onStockManagement={handleStockManagement}
                />

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Sales Summary Card */}
                    <DashboardCard
                        title="Σύνοψη Πωλήσεων"
                        icon="💰"
                        height="md"
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <StatCard
                                label="Τζίρος Εβδομάδας"
                                value={formatMoney(data.weeklySales.totalRevenue)}
                                isBig={true}
                                color="green"
                            />
                            <StatCard
                                label="Τζίρος Μήνα"
                                value={formatMoney(data.monthlySales.totalRevenue)}
                                color="blue"
                            />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Πωλήσεις εβδομάδας: </span>
                                    <span className="font-semibold">{data.weeklySales.totalSalesCount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Πωλήσεις μήνα: </span>
                                    <span className="font-semibold">{data.monthlySales.totalSalesCount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Μ.Ο Εβδομάδας: </span>
                                    <span className="font-semibold">{formatMoney(data.weeklySales.averageOrderValue)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Μ.Ο Μήνα: </span>
                                    <span className="font-semibold">{formatMoney(data.monthlySales.averageOrderValue)}</span>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Combined Tasks Card */}
                    <DashboardCard
                        title="To Do List"
                        icon="📋"
                        height="md"
                        headerRight={<TaskToggle />}
                        footer={
                            <div className="flex gap-2">
                                <Button variant="outline-primary" size="sm" className="flex-1" onClick={handleAddNewTask}>
                                    ➕ Προσθήκη task
                                </Button>
                                <Button variant="ghost-primary" size="sm" onClick={handleViewAllTasks}>
                                    📋 Προβολή Όλων
                                </Button>
                            </div>
                        }
                    >
                        {taskView === 'active' ? (
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
                        ) : (
                            <div className="space-y-3">
                                {data.dashboardTasks.thisWeekTasks.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">🌟</div>
                                        <p className="text-gray-500 italic">No tasks scheduled this week</p>
                                    </div>
                                ) : (
                                    data.dashboardTasks.thisWeekTasks.slice(0, 10).map((task) => (
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
                        )}
                    </DashboardCard>

                    {/* Top Products Card */}
                    <DashboardCard
                        title="Τα 5 καλύτερα προϊόντα του μήνα"
                        icon="🏆"
                        height="md"
                    >
                        <div className="space-y-3">
                            {data.topProductsThisMonth.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p className="text-gray-500 italic">Δεν υπάρχουν δεδομένα</p>
                                </div>
                            ) : (
                                data.topProductsThisMonth.map((product) => (
                                    <ListItem
                                        key={product.productId}
                                        primaryText={product.productName}
                                        secondaryText={`Κωδικός: ${product.productCode} | Πουλήθηκαν: ${product.totalItemsSold} κομμάτια`}
                                        rightText={formatMoney(product.totalRevenue)}
                                        rightTextColor="green"
                                    />
                                ))
                            )}
                        </div>
                    </DashboardCard>

                    {/* Recent Sales Card */}
                    <DashboardCard
                        title="Οι 5 πιο πρόσφατες πωλήσεις"
                        icon="🛒"
                        height="md"
                    >
                        <div className="space-y-3">
                            {data.recentSales.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🛍️</div>
                                    <p className="text-gray-500 italic">Δεν υπάρχουν πωλήσεις</p>
                                </div>
                            ) : (
                                data.recentSales.map((sale) => (
                                    <ListItem
                                        key={sale.id}
                                        primaryText={sale.customerName}
                                        secondaryText={`${formatDate(sale.saleDate)} | ${getPaymentMethodLabel(sale.paymentMethod)} | ${sale.productCount} ${sale.productCount > 1 ? 'προϊόντα' : 'προϊόν'}`}
                                        rightText={formatMoney(sale.grandTotal)}
                                        rightTextColor="green"
                                    />
                                ))
                            )}
                        </div>
                    </DashboardCard>

                    {/* Low Stock Alert Card */}
                    <DashboardCard
                        title="Προϊόντα με χαμηλό απόθεμα"
                        icon="⚠️"
                        height="md"
                        footer={
                            data.lowStockProducts.length > 0 && (
                                <Button variant="ghost-secondary" size="sm" onClick={handleViewAllLowStock} className="w-full">
                                    📋 Προβολή όλων
                                </Button>
                            )
                        }
                    >
                        <div className="space-y-3">
                            {data.lowStockProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">✅</div>
                                    <p className="text-gray-500 italic">Δεν υπάρχουν προϊόντα με χαμηλό απόθεμα</p>
                                </div>
                            ) : (
                                data.lowStockProducts.map((product) => (
                                    <ListItem
                                        key={product.productId}
                                        primaryText={product.productName}
                                        secondaryText={`Κωδικός: ${product.productCode}`}
                                        rightText={`Απόθεμα: ${product.currentStock} | Όριο: ${product.lowStockThreshold}`}
                                        rightTextColor="red"
                                        isWarning={true}
                                    />
                                ))
                            )}
                        </div>
                    </DashboardCard>

                    {/* Mispriced Products Card */}
                    <DashboardCard
                        title="Προϊόντα με λάθος τιμή"
                        icon="💸"
                        height="md"
                        footer={
                            data.mispricedProducts.length > 0 && (
                                <Button variant="ghost-secondary" size="sm" onClick={handleViewAllMispriced} className="w-full">
                                    💸 Προβολή όλων
                                </Button>
                            )
                        }
                    >
                        <div className="space-y-3">
                            {data.mispricedProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">💰</div>
                                    <p className="text-gray-500 italic">Όλες οι τιμές είναι σωστές</p>
                                </div>
                            ) : (
                                data.mispricedProducts.map((product) => {
                                    const showRetailPrice = product.issueType === 'RETAIL_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED';
                                    const showWholesalePrice = product.issueType === 'WHOLESALE_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED';

                                    let priceDetails = '';
                                    if (showRetailPrice && showWholesalePrice) {
                                        priceDetails = `Από λιανική προτεινόμενη: ${formatMoney(product.suggestedRetailPrice)} → ${formatMoney(product.finalRetailPrice)}\nΑπό χονδρική προτεινόμενη: ${formatMoney(product.suggestedWholesalePrice)} → ${formatMoney(product.finalWholesalePrice)}`;
                                    } else if (showRetailPrice) {
                                        priceDetails = `Από λιανική προτεινόμενη: ${formatMoney(product.suggestedRetailPrice)} → ${formatMoney(product.finalRetailPrice)}`;
                                    } else if (showWholesalePrice) {
                                        priceDetails = `Από χονδρική προτεινόμενη: ${formatMoney(product.suggestedWholesalePrice)} → ${formatMoney(product.finalWholesalePrice)}`;
                                    }

                                    return (
                                        <div
                                            key={product.productId}
                                            className="p-3 rounded-lg border-l-4 bg-yellow-50 border-yellow-400"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{product.productCode}</p>
                                                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                                                        {priceDetails}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-600">
                                                        {product.priceDifferencePercentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </DashboardCard>

                </div>
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleTaskSubmit}
                mode={modalMode}
                initialData={selectedTask ? {
                    id: selectedTask.id,
                    description: selectedTask.description,
                    date: selectedTask.date
                } : undefined}
            />

        </div>
    );
};

export default Dashboard;