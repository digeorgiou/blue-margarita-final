import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import {DashboardOverviewDTO} from "../types/api/dashboardInterface.ts";
import {Button, Card, ListItem, LoadingSpinner, StatCard, TaskItem, TaskStat} from '../components/ui'

const Dashboard: React.FC = () => {
    // State management
    const [data, setData] = useState<DashboardOverviewDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to format money
    const formatMoney = (amount: number): string => {
        return `€${amount}`;
    };

    // Function to format dates
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
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

    // Load data when component mounts
    useEffect(() => {
        loadDashboard();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <LoadingSpinner />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
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
            <div className="min-h-screen bg-gray-100 p-4">
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
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">

                {/* Dashboard Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Blue Margarita Dashboard</h1>
                            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
                        </div>
                        <Button onClick={loadDashboard} variant="primary">
                            🔄 Refresh
                        </Button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* Sales Summary Card */}
                    <Card title="Sales Summary" icon="💰" className="lg:col-span-1">
                        <div className="grid grid-cols-2 gap-6">
                            <StatCard
                                label="This Week"
                                value={formatMoney(data.weeklySales)}
                                isBig={true}
                                color="green"
                            />
                            <StatCard
                                label="This Month"
                                value={formatMoney(data.monthlySales)}
                                color="blue"
                            />
                        </div>
                    </Card>

                    {/* Tasks Overview Card */}
                    <Card title="Tasks Overview" icon="📋" className="lg:col-span-1">
                        <div className="grid grid-cols-3 gap-3">
                            <TaskStat
                                number={data.dashboardTasks.summary.overdueTasks}
                                label="Overdue"
                                color="red"
                            />
                            <TaskStat
                                number={data.dashboardTasks.summary.todayTasks}
                                label="Today"
                                color="yellow"
                            />
                            <TaskStat
                                number={data.dashboardTasks.summary.totalPendingTasks}
                                label="Total"
                                color="blue"
                            />
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
                                        secondaryText={formatDate(sale.saleDate)}
                                        rightText={formatMoney(sale.totalAmount)}
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
                                        secondaryText={formatDate(purchase.purchaseDate)}
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
                                        task={task}
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
                                        key={product.id}
                                        primaryText={product.name}
                                        secondaryText={`Stock: ${product.currentStock}`}
                                        rightText="LOW STOCK"
                                        rightTextColor="red"
                                        isWarning={true}
                                    />
                                ))
                            )}
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;