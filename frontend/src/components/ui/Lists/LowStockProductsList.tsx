import React, { useState, useEffect } from 'react';
import {dashboardService} from "../../../services/dashboardService.ts";
import {Button, Card, LoadingSpinner, Input} from "../"
import type { StockAlertDTO, Paginated} from "../../../types/api/dashboardInterface.ts";

interface LowStockProductsListProps {
    onNavigate: (page: string) => void;
}

const LowStockProductsList: React.FC<LowStockProductsListProps> = ({ onNavigate }) => {
    const [data, setData] = useState<Paginated<StockAlertDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [sortBy, setSortBy] = useState('currentStock');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                nameOrCode: searchTerm || undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: sortBy,
                sortDirection: sortDirection,
                isActive: true
            };

            // Create clean params object (remove empty filters)
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) =>
                    value !== '' && value !== null && value !== undefined
                )
            );

            const response = await dashboardService.getAllLowStockProducts(cleanParams);
            setData(response);

        } catch (err) {
            setError('Failed to load low stock products');
            console.error('Low stock products error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load data when dependencies change
    useEffect(() => {
        loadData();
    }, [currentPage, sortBy, sortDirection]);

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

    const getStockStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CRITICAL':
                return 'text-red-600 bg-red-100';
            case 'LOW':
                return 'text-yellow-600 bg-yellow-100';
            case 'OUT_OF_STOCK':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-blue-600 bg-blue-100';
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
                            <h1 className="text-3xl font-bold text-gray-900">⚠️ Low Stock Products</h1>
                            <p className="text-gray-700 mt-1">Products that need restocking attention</p>
                        </div>
                        <Button
                            onClick={() => onNavigate('dashboard')}
                            variant="secondary"
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search by product name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Results */}
                <Card title={`Low Stock Products (${data?.totalElements || 0} total)`} icon="📋">
                    {data?.data && data.data.length > 0 ? (
                        <>
                            {/* Table Header - Desktop */}
                            <div className="hidden md:grid md:grid-cols-6 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 mb-4">
                                <button
                                    onClick={() => handleSort('productName')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Product {sortBy === 'productName' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <button
                                    onClick={() => handleSort('productCode')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Code {sortBy === 'productCode' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <span>Category</span>
                                <button
                                    onClick={() => handleSort('currentStock')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Current Stock {sortBy === 'currentStock' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <span>Min Stock</span>
                                <button
                                    onClick={() => handleSort('stockStatus')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Status {sortBy === 'stockStatus' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                            </div>

                            {/* Product List */}
                            <div className="space-y-3">
                                {data.data.map((product) => (
                                    <div key={product.productId} className="p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-400">
                                        {/* Mobile Layout */}
                                        <div className="md:hidden">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{product.productName}</p>
                                                    <p className="text-sm text-gray-600">Code: {product.productCode}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStockStatusColor(product.stockStatus)}`}>
                                                    {product.stockStatus}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Current: <strong>{product.currentStock}</strong></span>
                                                <span>Min: <strong>{product.lowStockThreshold}</strong></span>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900">{product.productName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700">{product.productCode}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-red-600">{product.currentStock}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700">{product.lowStockThreshold}</p>
                                            </div>
                                            <div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStockStatusColor(product.stockStatus)}`}>
                                                    {product.stockStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Great news!</h3>
                            <p className="text-gray-600">All products are well stocked</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default LowStockProductsList;