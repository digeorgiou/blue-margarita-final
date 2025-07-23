import React, { useState, useEffect } from 'react';
import { dashboardService } from "../../../services/dashboardService.ts";
import { stockManagementService } from "../../../services/stockManagementService.ts";
import { Button, Card, LoadingSpinner, Input } from "../"
import type { StockAlertDTO, Paginated } from "../../../types/api/dashboardInterface.ts";
import type { CategoryForDropdownDTO } from "../../../types/api/categoryInterface.ts";
import type { StockUpdateDTO, StockUpdateResultDTO } from "../../../types/api/stockManagementInterface.ts";
import { authService } from "../../../services/authService.ts";

interface LowStockProductsListProps {
    onNavigate: (page: string) => void;
}

const getCategoriesForDropdown = async (): Promise<CategoryForDropdownDTO[]> => {
    try {
        const response = await fetch('/api/categories/dropdown', {
            method: 'GET',
            headers: authService.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Categories fetch error:', error);
        throw error;
    }
};

const LowStockProductsList: React.FC<LowStockProductsListProps> = ({ onNavigate }) => {
    const [data, setData] = useState<Paginated<StockAlertDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);

    // Modal states
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<StockAlertDTO | null>(null);
    const [newStockAmount, setNewStockAmount] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    // Filter states
    const [nameOrCodeFilter, setNameOrCodeFilter] = useState('');
    const [categoryIdFilter, setCategoryIdFilter] = useState('');
    const [materialNameFilter, setMaterialNameFilter] = useState('');
    const [minStockFilter, setMinStockFilter] = useState('');
    const [maxStockFilter, setMaxStockFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [sortBy, setSortBy] = useState('stock');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

    // Load categories on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await getCategoriesForDropdown();
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to load categories:', err);
                // Don't fail the whole component if categories fail
            }
        };
        loadCategories();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                nameOrCode: nameOrCodeFilter.trim() || undefined,
                categoryId: categoryIdFilter ? Number(categoryIdFilter) : undefined,
                minStock: minStockFilter ? Number(minStockFilter) : undefined,
                maxStock: maxStockFilter ? Number(maxStockFilter) : undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: sortBy,
                sortDirection: sortDirection,
                isActive: true
            };

            console.log('Sending params:', params); // Debug log

            // Create clean params object (remove empty filters)
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) =>
                    value !== '' && value !== null && value !== undefined
                )
            );

            console.log('Clean params:', cleanParams); // Debug log

            const response = await dashboardService.getAllLowStockProducts(cleanParams);
            setData(response);

        } catch (err) {
            setError('Failed to load low stock products');
            console.error('Low stock products error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load data when dependencies change (but not on filter input changes)
    useEffect(() => {
        loadData();
    }, [currentPage, sortBy, sortDirection]);

    // Debounced search for text filters
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(0); // Reset to first page when filtering
            loadData();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [nameOrCodeFilter, materialNameFilter]);

    // Immediate load for number/dropdown filters
    useEffect(() => {
        setCurrentPage(0);
        loadData();
    }, [categoryIdFilter, minStockFilter, maxStockFilter]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
    };

    const handleClearFilters = () => {
        setNameOrCodeFilter('');
        setCategoryIdFilter('');
        setMaterialNameFilter('');
        setMinStockFilter('');
        setMaxStockFilter('');
        setCurrentPage(0);
    };

    const handleUpdateStock = (product: StockAlertDTO) => {
        setSelectedProduct(product);
        setNewStockAmount("");
        setShowUpdateModal(true);
    };

    const handleModalClose = () => {
        setShowUpdateModal(false);
        setSelectedProduct(null);
        setNewStockAmount('');
        setUpdateLoading(false);
    };

    const handleStockUpdate = async () => {
        if (!selectedProduct || !newStockAmount) return;

        try {
            setUpdateLoading(true);

            const stockUpdateData: StockUpdateDTO = {
                productId: selectedProduct.productId,
                updateType : 'SET',
                quantity: parseInt(newStockAmount),
                updaterUserId: 1 // might want to get this from auth context
            };

            const result: StockUpdateResultDTO = await stockManagementService.updateProductStock(stockUpdateData);

            // Show success message (you might want to add a toast notification here)
            console.log('Stock updated successfully:', result);

            // Close modal
            handleModalClose();

            // Refresh the data
            await loadData();

        } catch (error) {
            console.error('Failed to update stock:', error);
            setError('Failed to update stock. Please try again.');
        } finally {
            setUpdateLoading(false);
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

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name/Code
                            </label>
                            <Input
                                type="text"
                                value={nameOrCodeFilter}
                                onChange={(e) => setNameOrCodeFilter(e.target.value)}
                                placeholder="Search by name or code..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={categoryIdFilter}
                                onChange={(e) => setCategoryIdFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Stock
                            </label>
                            <Input
                                type="number"
                                value={minStockFilter}
                                onChange={(e) => setMinStockFilter(e.target.value)}
                                placeholder="Min stock..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Stock
                            </label>
                            <Input
                                type="number"
                                value={maxStockFilter}
                                onChange={(e) => setMaxStockFilter(e.target.value)}
                                placeholder="Max stock..."
                            />
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleClearFilters} variant="secondary" size="sm">
                            Clear Filters
                        </Button>
                        <Button onClick={loadData} variant="outline-secondary" size="sm">
                            🔄 Refresh
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <Card title={`Low Stock Products (${data?.totalElements || 0} total)`} icon="⚠️">
                    {data && data.data && data.data.length > 0 ? (
                        <>
                            {/* Table Header - Desktop */}
                            <div className="hidden md:grid md:grid-cols-5 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 mb-4">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Product Name {sortBy === 'name' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <button
                                    onClick={() => handleSort('code')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Code {sortBy === 'code' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <button
                                    onClick={() => handleSort('stock')}
                                    className="text-left hover:text-blue-600 transition-colors"
                                >
                                    Current Stock {sortBy === 'stock' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </button>
                                <span>Threshold</span>
                                <span>Status</span>
                            </div>

                            {/* Product List */}
                            <div className="space-y-3">
                                {data.data.map((product) => (
                                    <div
                                        key={product.productId}
                                        className="p-4 rounded-lg border-l-4 border-red-400 bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        {/* Mobile Layout */}
                                        <div className="md:hidden">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                                                    <p className="text-sm text-gray-600">Code: {product.productCode}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase">
                                                        {product.stockStatus}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Stock: <span className="font-semibold text-red-600">{product.currentStock}</span></span>
                                                <span className="text-gray-600">Threshold: {product.lowStockThreshold}</span>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900">{product.productName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700">{product.productCode}</p>
                                            </div>
                                            <div>
                                                <span className="font-bold text-red-600">{product.currentStock}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-700">{product.lowStockThreshold}</span>
                                            </div>
                                            <div>
                                                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase">
                                                    {product.stockStatus}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <Button
                                                    onClick={() => handleUpdateStock(product)}
                                                    variant="primary"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    Update Stock
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Showing {(data.currentPage * data.pageSize) + 1} to {Math.min((data.currentPage + 1) * data.pageSize, data.totalElements)} of {data.totalElements} products
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
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No low stock products found</h3>
                            <p className="text-gray-600 mb-4">
                                {nameOrCodeFilter || categoryIdFilter || materialNameFilter || minStockFilter || maxStockFilter
                                    ? 'Try adjusting your filters to see more products.'
                                    : 'All products are well stocked!'}
                            </p>
                            <Button onClick={handleClearFilters} variant="secondary">
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Update Stock Modal */}
                {showUpdateModal && selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
                                    <button
                                        onClick={handleModalClose}
                                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                                        disabled={updateLoading}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Product Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900">{selectedProduct.productName}</h3>
                                        <p className="text-sm text-gray-600">Code: {selectedProduct.productCode}</p>
                                        <p className="text-sm text-gray-600">Current Stock:
                                            <span className={`font-semibold ml-1 ${selectedProduct.currentStock <= 5 ? 'text-red-600' : selectedProduct.currentStock <= 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {selectedProduct.currentStock}
                                            </span>
                                        </p>
                                    </div>

                                    {/* New Stock Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Stock Amount *
                                        </label>
                                        <Input
                                            type="number"
                                            value={newStockAmount}
                                            onChange={(e) => setNewStockAmount(e.target.value)}
                                            placeholder="Enter new stock amount..."
                                            disabled={updateLoading}
                                            min="0"
                                        />
                                    </div>


                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleModalClose}
                                            variant="secondary"
                                            disabled={updateLoading}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleStockUpdate}
                                            variant="primary"
                                            disabled={updateLoading || !newStockAmount}
                                            className="flex-1"
                                        >
                                            {updateLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Updating...
                                                </div>
                                            ) : (
                                                'Update Stock'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LowStockProductsList;