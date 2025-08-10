import React, { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import { profitLossService, ProfitLossReportDTO, ProfitLossPageInitData } from '../services/profitLossService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3, Search, ChevronDown, ChevronUp  } from 'lucide-react';
import { getExpenseTypeDisplayName } from "../utils/EnumUtils.ts";

const ProfitLossPage = () => {
    // State management
    const [pageData, setPageData] = useState<ProfitLossPageInitData | null>(null);
    const [customReport, setCustomReport] = useState<ProfitLossReportDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [customReportLoading, setCustomReportLoading] = useState(false);

    // Date filter state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // =============================================================================
    // INITIALIZATION
    // =============================================================================

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        clearErrors();

        try {
            const data = await profitLossService.getProfitLossPageInitData();
            setPageData(data);
        } catch (error) {
            handleApiError(error, 'Failed to load profit and loss data');
        } finally {
            setLoading(false);
        }
    };

    // =============================================================================
    // CUSTOM REPORT GENERATION
    // =============================================================================

    const handleGenerateCustomReport = async () => {
        if (!dateFrom || !dateTo) {
            handleApiError(new Error('Please select both start and end dates'), 'Date Selection Required');
            return;
        }

        if (new Date(dateFrom) > new Date(dateTo)) {
            handleApiError(new Error('Start date cannot be after end date'), 'Invalid Date Range');
            return;
        }

        setCustomReportLoading(true);
        clearErrors();

        try {
            const report = await profitLossService.generateCustomReport(dateFrom, dateTo);
            setCustomReport(report);
        } catch (error) {
            handleApiError(error, 'Failed to generate custom report');
        } finally {
            setCustomReportLoading(false);
        }
    };

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatPercentage = (percentage: number): string => {
        return `${percentage.toFixed(2)}%`;
    };

    const formatDateRange = (startDate: string, endDate: string): string => {
        const start = new Date(startDate).toLocaleDateString();
        const end = new Date(endDate).toLocaleDateString();
        return `${start} - ${end}`;
    };

    const getProfitColor = (netProfit: number): string => {
        if (netProfit > 0) return 'text-green-600';
        if (netProfit < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getProfitIcon = (netProfit: number) => {
        if (netProfit > 0) return <TrendingUp className="h-5 w-5 text-green-600" />;
        if (netProfit < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
        return <BarChart3 className="h-5 w-5 text-gray-600" />;
    };

    // =============================================================================
    // MONTHLY REPORT TOGGLE STATES
    // =============================================================================

    const [monthCardView, setMonthCardView] = useState<'current' | 'last'>('current');
    const [yearCardView, setYearCardView] = useState<'current' | 'last'>('current');

    // =============================================================================
    // EXPENSE DISTRIBUTION TOGGLE STATES
    // =============================================================================

    const [showMonthExpenseDistribution, setShowMonthExpenseDistribution] = useState(false);
    const [showYearExpenseDistribution, setShowYearExpenseDistribution] = useState(false);
    const [showCustomExpenseDistribution, setShowCustomExpenseDistribution] = useState(false);

    // =============================================================================
    // TOGGLE COMPONENTS
    // =============================================================================

    const MonthlyToggle: React.FC<{
        currentView: 'current' | 'last';
        onToggle: (view: 'current' | 'last') => void;
    }> = ({ currentView, onToggle }) => (
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => onToggle('current')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'current'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Τρέχων Μήνας
            </button>
            <button
                onClick={() => onToggle('last')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'last'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Προηγούμενος Μήνας
            </button>
        </div>
    );

    const YearlyToggle: React.FC<{
        currentView: 'current' | 'last';
        onToggle: (view: 'current' | 'last') => void;
    }> = ({ currentView, onToggle }) => (
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button
                onClick={() => onToggle('current')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'current'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Τρέχον Έτος
            </button>
            <button
                onClick={() => onToggle('last')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'last'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Προηγούμενο Έτος
            </button>
        </div>
    );

    // =============================================================================
    // EXPENSE BREAKDOWN COMPONENT
    // =============================================================================

    const ExpenseBreakdown: React.FC<{
        expensesByType: Array<{ expenseType: string; totalAmount: number; percentage: number }>;
        isExpanded: boolean;
        onToggle: () => void;
    }> = ({ expensesByType, isExpanded, onToggle }) => {
        if (expensesByType.length === 0) {
            return (
                <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">Δεν υπάρχουν έξοδα για αυτή την περίοδο</p>
                </div>
            );
        }

        return (
            <div className="pt-4 border-t">
                <button
                    onClick={onToggle}
                    className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                    <h4 className="text-sm font-semibold text-gray-700">Προβολή Κατανομής Εξόδων</h4>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                            {expensesByType.length} κατηγορί{expensesByType.length === 1 ? 'α' : 'ες'}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                    </div>
                </button>

                {isExpanded && (
                    <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {expensesByType.map((expense, index) => (
                            <div key={index} className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-md">
                                <span className="text-gray-700 font-medium">{getExpenseTypeDisplayName(expense.expenseType)}</span>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">{formatCurrency(expense.totalAmount)}</div>
                                    <div className="text-xs text-gray-500">
                                        {formatPercentage(expense.percentage)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };


    // =============================================================================
    // REPORT CARD COMPONENT
    // =============================================================================

    const ReportCard: React.FC<{
        title: string;
        report: ProfitLossReportDTO;
        showExpenseBreakdown?: boolean;
        hasToggle?: boolean;
        duration?: string;
        toggleView?: 'current' | 'last';
        onToggle?: (view: 'current' | 'last') => void;
        expenseToggleState?: boolean;
        onExpenseToggle?: () => void;
    }> = ({ title, report, showExpenseBreakdown = false, hasToggle = false, duration, toggleView, onToggle, expenseToggleState = false,
                                    onExpenseToggle }) => (
        <CustomCard className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        <Calendar className="h-5 w-5 text-gray-500" />
                    </div>

                    {/* Toggle Component */}
                    {duration === 'month' && (
                        <MonthlyToggle currentView={toggleView} onToggle={onToggle} />
                    )}
                    {duration === 'year' && (
                        <YearlyToggle currentView={toggleView} onToggle={onToggle} />
                    )}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                    {formatDateRange(report.periodStart, report.periodEnd)}
                </div>

                <div className="space-y-4">
                    {/* Revenue */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Τζίρος Περιόδου</span>
                        </div>
                        <span className="font-semibold text-green-600">
                            {formatCurrency(report.totalRevenue)}
                        </span>
                    </div>

                    {/* Expenses */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">Σύνολο εξόδων</span>
                        </div>
                        <span className="font-semibold text-red-600">
                            {formatCurrency(report.totalExpenses)}
                        </span>
                    </div>

                    {/* Net Profit */}
                    <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center space-x-2">
                            {getProfitIcon(report.netProfit)}
                            <span className="text-sm font-medium">{report.netProfit > 0 ? 'Κέρδος' : 'Ζημιά'}</span>
                        </div>
                        <span className={`font-bold text-lg ${getProfitColor(report.netProfit)}`}>
                            {formatCurrency(report.netProfit)}
                        </span>
                    </div>

                    {/* Profit Margin */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Περιθώριο Κέρδους</span>
                        <span className={`font-semibold ${getProfitColor(report.netProfit)}`}>
                            {formatPercentage(report.profitMargin)}
                        </span>
                    </div>

                    {/* Transaction Counts */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div className="text-center">
                            <div className="font-semibold text-blue-600">{report.totalSales}</div>
                            <div className="text-xs text-gray-600">Πωλήσεις</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-orange-600">{report.totalExpenseEntries}</div>
                            <div className="text-xs text-gray-600">Έξοδα</div>
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    {showExpenseBreakdown && onExpenseToggle && (
                        <ExpenseBreakdown
                            expensesByType={report.expensesByType}
                            isExpanded={expenseToggleState}
                            onToggle={onExpenseToggle}
                        />
                    )}
                </div>
            </div>
        </CustomCard>
    );

    // =============================================================================
    // LOADING STATE
    // =============================================================================

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profit and loss data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // =============================================================================
    // MAIN RENDER
    // =============================================================================

    return (
        <div className="p-6 space-y-6">

            {/* Error Alert */}
            {generalError && (
                <Alert variant="error" onClose={clearErrors}>
                    {generalError}
                </Alert>
            )}

            {/* Quick Reports Section */}
            {pageData && (
                <div className="space-y-6">
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Report Card 1 */}
                            <ReportCard
                                title="Αναφορά Μήνα"
                                report={monthCardView === 'current' ? pageData.currentMonthReport : pageData.lastMonthReport}
                                duration='month'
                                hasToggle={true}
                                toggleView={monthCardView}
                                onToggle={setMonthCardView}
                                showExpenseBreakdown={true}
                                expenseToggleState={showMonthExpenseDistribution}
                                onExpenseToggle={() => setShowMonthExpenseDistribution(!showMonthExpenseDistribution)}
                            />

                            {/* Year to Date Card (no toggle) */}
                            <ReportCard
                                title="Αναφορά Έτους"
                                report={yearCardView === 'current' ? pageData.currentYearReport : pageData.lastYearReport}
                                duration='year'
                                hasToggle={true}
                                toggleView={yearCardView}
                                onToggle={setYearCardView}
                                showExpenseBreakdown={true}
                                expenseToggleState={showYearExpenseDistribution}
                                onExpenseToggle={() => setShowYearExpenseDistribution(!showYearExpenseDistribution)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Date Range Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Custom Date Range Report</h2>

                <CustomCard>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    max={dateTo || undefined}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min={dateFrom || undefined}
                                />
                            </div>

                            <div>
                                <Button
                                    onClick={handleGenerateCustomReport}
                                    disabled={!dateFrom || !dateTo || customReportLoading}
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    {customReportLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                    <span>Generate Report</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CustomCard>

                {/* Custom Report Results */}
                {customReport && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ReportCard
                            title="Custom Period Report"
                            report={customReport}
                            showExpenseBreakdown={true}
                            expenseToggleState={showCustomExpenseDistribution}
                            onExpenseToggle={() => setShowCustomExpenseDistribution(!showCustomExpenseDistribution)}
                        />

                        {/* Additional Analysis Card */}
                        <CustomCard>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-2">Period Performance</div>
                                        <div className="text-lg font-semibold">
                                            {customReport.netProfit >= 0 ? '📈 Profitable' : '📉 Loss Period'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(customReport.totalRevenue)}
                                            </div>
                                            <div className="text-sm text-green-700">Revenue</div>
                                        </div>

                                        <div className="text-center p-3 bg-red-50 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600">
                                                {formatCurrency(customReport.totalExpenses)}
                                            </div>
                                            <div className="text-sm text-red-700">Expenses</div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="text-sm text-gray-600 mb-2">Expense Distribution</div>
                                        {customReport.expensesByType.length > 0 ? (
                                            <div className="space-y-2">
                                                {customReport.expensesByType.slice(0, 3).map((expense, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <span className="text-sm">{expense.expenseType}</span>
                                                        <span className="text-sm font-medium">
                                                            {formatPercentage(expense.percentage)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No expenses in this period</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CustomCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfitLossPage;