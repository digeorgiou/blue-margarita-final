import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Calendar,
    TrendingUp,
    Users,
    MapPin,
    DollarSign,
    Package,
    BarChart3,
    PieChart,
    Target,
} from 'lucide-react';
import { Button, Alert, LoadingSpinner, CustomCard } from '../components/ui/common';
import { CustomDateInput } from '../components/ui/inputs';
import { productService } from '../services/productService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type { ProductSalesAnalyticsDTO } from '../types/api/productInterface';
import { formatCurrency, formatDate, formatNumber } from "../utils/formatters.ts";

interface ProductSalesAnalyticsPageProps {
    onNavigate: (page: string) => void;
    productId: string;
}

const ProductSalesAnalyticsPage: React.FC<ProductSalesAnalyticsPageProps> = ({
                                                                                 onNavigate,
                                                                                 productId,
                                                                             }) => {
    // State management
    const [analytics, setAnalytics] = useState<ProductSalesAnalyticsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Fetch analytics data
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            clearErrors();
            const data = await productService.getProductSalesAnalytics(
                parseInt(productId),
                startDate,
                endDate
            );
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount and date changes
    useEffect(() => {
        fetchAnalytics();
    }, [productId, startDate, endDate]);


    // Calculate week start and end dates from week number and year
    const getWeekDateRange = (year: number, weekNumber: number): { start: string; end: string } => {
        // January 4th is always in week 1 (ISO 8601)
        const jan4 = new Date(year, 0, 4);

        // Find the Monday of week 1
        const week1Monday = new Date(jan4);
        week1Monday.setDate(jan4.getDate() - jan4.getDay() + 1);

        // Calculate the Monday of the target week
        const targetWeekMonday = new Date(week1Monday);
        targetWeekMonday.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);

        // Calculate the Sunday of the target week
        const targetWeekSunday = new Date(targetWeekMonday);
        targetWeekSunday.setDate(targetWeekMonday.getDate() + 6);

        return {
            start: targetWeekMonday.toLocaleDateString('el-GR'),
            end: targetWeekSunday.toLocaleDateString('el-GR')
        };
    };

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Αναλύσεις Πωλήσεων</h1>
                        </div>
                    </div>

                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => onNavigate('manage-products')}
                                variant="yellow"
                                className="flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Επιστροφή στα Προϊόντα
                            </Button>
                        </div>
                </div>

                {/* Date Filters */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <CustomDateInput
                            label="Από Ημερομηνία"
                            value={startDate}
                            onChange={setStartDate}
                            icon={<Calendar className="w-5 h-5 text-blue-500" />}
                        />
                        <CustomDateInput
                            label="Έως Ημερομηνία"
                            value={endDate}
                            onChange={setEndDate}
                            icon={<Calendar className="w-5 h-5 text-blue-500" />}
                        />
                        <div className="flex items-end">
                             <Button
                                onClick={fetchAnalytics}
                                variant="pink"
                                className="w-full py-4"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner/> : 'Ανανέωση Δεδομένων'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {generalError && (
                <Alert
                    variant="error"
                    className="mb-6"
                />
            )}

             {/*Loading State*/}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner/>
                </div>
            ) : analytics ? (
                <div className="space-y-6 mt-6">
                    {/* Core Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <CustomCard
                            title="Στοιχεία Προϊόντος"
                            icon={<Package className="text-purple-600" />}
                            className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200"
                        >
                            <div className="space-y-3 py-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Όνομα:</span>
                                    <span className="font-semibold text-purple-700">{analytics.productName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Κωδικός:</span>
                                    <span className="font-semibold text-purple-700">{analytics.productCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Τρέχον απόθεμα:</span>
                                    <span className="font-semibold text-purple-700">{formatNumber(analytics.currentStock)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Τελευταία πώληση:</span>
                                    <span className="font-semibold text-purple-700">{formatDate(analytics.lastSaleDate)}</span>
                                </div>
                            </div>
                        </CustomCard>

                        <CustomCard
                            title="Συνολικές Πωλήσεις"
                            icon={<DollarSign className="text-green-600" />}
                            className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200"
                        >
                            <div className="text-center py-4">
                                <div className="text-3xl font-bold text-green-700 mb-2">
                                    {formatCurrency(analytics.totalRevenue)}
                                </div>
                                <div className="text-sm text-green-600">
                                    {formatNumber(analytics.totalQuantitySold)} τεμάχια σε {analytics.numberOfSales} πωλήσεις
                                </div>
                            </div>
                        </CustomCard>

                        <CustomCard
                            title="Μέσοι Όροι"
                            icon={<Target className="text-blue-600" />}
                            className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200"
                        >
                            <div className="space-y-3 py-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Μ.Ο. τιμή πώλησης:</span>
                                    <span className="font-semibold text-blue-700">{formatCurrency(analytics.averageSellingPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Μ.Ο. ποσότητα/πώληση:</span>
                                    <span className="font-semibold text-blue-700">{formatNumber(analytics.averageQuantityPerSale)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Μ.Ο. έσοδα/πώληση:</span>
                                    <span className="font-semibold text-blue-700">{formatCurrency(analytics.averageRevenuePerSale)}</span>
                                </div>
                            </div>
                        </CustomCard>
                    </div>

                    {/* Sales Data Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Weekly Data */}
                        <CustomCard
                            title="Προηγούμενη Εβδομάδα"
                            icon={<TrendingUp className="text-orange-600" />}
                            className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200"
                        >
                            <div className="space-y-3 py-2">
                                <div className="text-center text-xs text-gray-500 mb-3">
                                    {(() => {
                                        const weekRange = getWeekDateRange(analytics.weeklySalesData.year, analytics.weeklySalesData.weekOfYear);
                                        return `${weekRange.start} - ${weekRange.end}`;
                                    })()}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Ποσότητα:</span>
                                    <span className="font-semibold text-orange-700">{formatNumber(analytics.weeklySalesData.quantitySold)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Έσοδα:</span>
                                    <span className="font-semibold text-orange-700">{formatCurrency(analytics.weeklySalesData.revenue)}</span>
                                </div>
                            </div>
                        </CustomCard>

                        {/* Monthly Data */}
                        <CustomCard
                            title="Προηγούμενος Μήνας"
                            icon={<Calendar className="text-indigo-600" />}
                            className="bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200"
                        >
                            <div className="space-y-3 py-2">
                                <div className="text-center text-xs text-gray-500 mb-3">
                                    {analytics.monthlySalesData.month}/{analytics.monthlySalesData.year}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Ποσότητα:</span>
                                    <span className="font-semibold text-indigo-700">{formatNumber(analytics.monthlySalesData.quantitySold)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Έσοδα:</span>
                                    <span className="font-semibold text-indigo-700">{formatCurrency(analytics.monthlySalesData.revenue)}</span>
                                </div>
                            </div>
                        </CustomCard>

                        {/* Yearly Data */}
                        <CustomCard
                            title="Προηγούμενο Έτος"
                            icon={<PieChart className="text-teal-600" />}
                            className="bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200"
                        >
                            <div className="space-y-3 py-2">
                                <div className="text-center text-xs text-gray-500 mb-3">
                                    Έτος {analytics.yearlySalesData.year}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Ποσότητα:</span>
                                    <span className="font-semibold text-teal-700">{formatNumber(analytics.yearlySalesData.quantitySold)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Έσοδα:</span>
                                    <span className="font-semibold text-teal-700">{formatCurrency(analytics.yearlySalesData.revenue)}</span>
                                </div>
                            </div>
                        </CustomCard>
                    </div>

                    {/* Top Locations and Customers Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Locations */}
                        <CustomCard
                            title="Κορυφαίες Τοποθεσίες"
                            icon={<MapPin className="text-red-600" />}
                            className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200"
                            height="lg"
                        >
                            <div className="space-y-3">
                                {analytics.topLocationsByRevenue.length > 0 ? (
                                    analytics.topLocationsByRevenue.map((location, index) => (
                                        <div key={location.locationId} className="bg-white rounded-lg p-3 border border-red-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{location.locationName}</span>
                                                </div>
                                                <span className="font-bold text-red-700">{formatCurrency(location.revenue)}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                                <div>
                                                    <span className="font-medium">Ποσότητα:</span><br />
                                                    {formatNumber(location.quantitySold)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Πωλήσεις:</span><br />
                                                    {location.numberOfSales}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Μ.Ο. τιμή:</span><br />
                                                    {formatCurrency(location.averagePrice)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Δεν υπάρχουν δεδομένα τοποθεσιών</p>
                                    </div>
                                )}
                            </div>
                        </CustomCard>

                        {/* Top Customers */}
                        <CustomCard
                            title="Κορυφαίοι Πελάτες"
                            icon={<Users className="text-blue-600" />}
                            className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200"
                            height="lg"
                        >
                            <div className="space-y-3">
                                {analytics.topCustomersByQuantity.length > 0 ? (
                                    analytics.topCustomersByQuantity.map((customer, index) => (
                                        <div key={customer.customerId} className="bg-white rounded-lg p-3 border border-blue-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900">{customer.customerName}</span>
                                                        <div className="text-xs text-gray-500">{customer.customerEmail}</div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-blue-700">{formatNumber(customer.quantityPurchased)}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                                <div>
                                                    <span className="font-medium">Έσοδα:</span><br />
                                                    {formatCurrency(customer.totalRevenue)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Παραγγελίες:</span><br />
                                                    {customer.numberOfSales}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Τελ. παραγγελία:</span><br />
                                                    {formatDate(customer.lastOrderDate)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Δεν υπάρχουν δεδομένα πελατών</p>
                                    </div>
                                )}
                            </div>
                        </CustomCard>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν δεδομένα</h3>
                    <p className="text-gray-500">Δεν υπάρχουν δεδομένα πωλήσεων για την επιλεγμένη περίοδο.</p>
                </div>
            )}
        </div>
    );
};

export default ProductSalesAnalyticsPage;