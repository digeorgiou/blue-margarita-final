import React, { useState, useEffect } from 'react';
import { dashboardService } from "../../../services/dashboardService.ts";
import { Button, Card, LoadingSpinner, Input } from "../"
import { getPricingIssueTypeLabel } from "../../../types/api/dashboardInterface.ts";
import type { MispricedProductAlertDTO, Paginated } from "../../../types/api/dashboardInterface.ts";

interface MispricedProductsListProps {
    onNavigate: (page: string) => void;
}

const MispricedProductsList: React.FC<MispricedProductsListProps> = ({ onNavigate }) => {
    const [data, setData] = useState<Paginated<MispricedProductAlertDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [thresholdPercentage, setThresholdPercentage] = useState(20);
    const [issueTypeFilter, setIssueTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [sortBy, setSortBy] = useState('priceDifferencePercentage');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

    // Format money function
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                nameOrCode: searchTerm || undefined,
                thresholdPercentage: thresholdPercentage,
                issueType: issueTypeFilter || undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: sortBy,
                sortDirection: sortDirection
            };

            // Create clean params object (remove empty filters)
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) =>
                    value !== '' && value !== null && value !== undefined
                )
            );

            const response = await dashboardService.getAllMispricedProducts(cleanParams);

            // DEBUG: Log the actual response structure
            console.log('Mispriced Products API Response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));

            setData(response);

        } catch (err) {
            setError('Failed to load mispriced products');
            console.error('Mispriced products error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load data when dependencies change
    useEffect(() => {
        loadData();
    }, [currentPage, sortBy, sortDirection, thresholdPercentage, issueTypeFilter]);

    // Debounced search
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(0);
            loadData();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
    };

    const hasNext = data !== null ? data.currentPage + 1 < data.totalPages : false;
    const hasPrevious = data !== null ? data.currentPage > 0 : false;

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">😵</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={loadData} variant="primary">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">💸 Mispriced Products</h1>
                            <p className="text-gray-700 mt-1">Products with significant pricing differences from suggested prices</p>
                        </div>
                        <Button
                            onClick={() => onNavigate('dashboard')}
                            variant="secondary"
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Products
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by product name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Threshold %
                            </label>
                            <Input
                                type="number"
                                placeholder="20"
                                value={thresholdPercentage}
                                onChange={(e) => setThresholdPercentage(Number(e.target.value) || 20)}
                                min="0"
                                max="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue Type
                            </label>
                            <select
                                value={issueTypeFilter}
                                onChange={(e) => setIssueTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="RETAIL_UNDERPRICED">Retail Underpriced</option>
                                <option value="WHOLESALE_UNDERPRICED">Wholesale Underpriced</option>
                                <option value="BOTH_UNDERPRICED">Both Underpriced</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <Card title={`Mispriced Products (${data?.totalElements || 0} total)`} icon="📋">
                    {data?.data && data.data.length > 0 ? (
                        <>
                            {/* Table Header - Desktop */}
                            <div className="hidden lg:grid lg:grid-cols-5 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 mb-4">
                                <button
                                    onClick={() => handleSort('productName')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Product {sortBy === 'productName' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <span>Issue Type</span>
                                <span>Retail Prices</span>
                                <span>Wholesale Prices</span>
                                <button
                                    onClick={() => handleSort('priceDifferencePercentage')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Difference % {sortBy === 'priceDifferencePercentage' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                            </div>

                            {/* Product List */}
                            <div className="space-y-4">
                                {data.data.map((product) => {
                                    const showRetailPrice = product.issueType === 'RETAIL_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED';
                                    const showWholesalePrice = product.issueType === 'WHOLESALE_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED';

                                    return (
                                        <div key={product.productId} className="p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-400">
                                            {/* Mobile/Tablet Layout */}
                                            <div className="lg:hidden">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{product.productName}</p>
                                                        <p className="text-sm text-gray-600">Code: {product.productCode}</p>
                                                        <p className="text-sm text-gray-600">Category: {product.categoryName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-red-600 text-lg">
                                                            {product.priceDifferencePercentage.toFixed(1)}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">underpriced</div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                                        {getPricingIssueTypeLabel(product.issueType)}
                                                    </span>
                                                </div>

                                                {showRetailPrice && (
                                                    <div className="mb-2">
                                                        <p className="text-sm font-medium text-gray-700">Retail Price:</p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatMoney(product.suggestedRetailPrice)} → <span className="font-semibold text-red-600">{formatMoney(product.finalRetailPrice)}</span>
                                                        </p>
                                                    </div>
                                                )}

                                                {showWholesalePrice && (
                                                    <div className="mb-2">
                                                        <p className="text-sm font-medium text-gray-700">Wholesale Price:</p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatMoney(product.suggestedWholesalePrice)} → <span className="font-semibold text-red-600">{formatMoney(product.finalWholesalePrice)}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Desktop Layout */}
                                            <div className="hidden lg:grid lg:grid-cols-5 gap-4 items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{product.productName}</p>
                                                    <p className="text-sm text-gray-600">{product.productCode}</p>
                                                    <p className="text-xs text-gray-500">{product.categoryName}</p>
                                                </div>
                                                <div>
                                                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                                        {getPricingIssueTypeLabel(product.issueType)}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    {showRetailPrice ? (
                                                        <p className="text-gray-600">
                                                            {formatMoney(product.suggestedRetailPrice)} → <span className="font-semibold text-red-600">{formatMoney(product.finalRetailPrice)}</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-400 italic">Not affected</p>
                                                    )}
                                                </div>
                                                <div className="text-sm">
                                                    {showWholesalePrice ? (
                                                        <p className="text-gray-600">
                                                            {formatMoney(product.suggestedWholesalePrice)} → <span className="font-semibold text-red-600">{formatMoney(product.finalWholesalePrice)}</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-gray-400 italic">Not affected</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-red-600 text-lg">
                                                        {product.priceDifferencePercentage.toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">underpriced</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        Showing {(currentPage * pageSize) + 1} to {Math.min((currentPage + 1) * pageSize, data.totalElements)} of {data.totalElements} products
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={!hasPrevious}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Previous
                                        </Button>
                                        <span className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                                            Page {currentPage + 1} of {data.totalPages}
                                        </span>
                                        <Button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={!hasNext}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Great news!</h3>
                            <p className="text-gray-600">All prices are optimal</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MispricedProductsList;