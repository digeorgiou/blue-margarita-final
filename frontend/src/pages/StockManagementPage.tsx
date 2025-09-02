import React, { useState, useEffect } from 'react';
import { Alert, CustomCard } from '../components/ui/common';
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { StockManagementFilterPanel } from '../components/ui/filterPanels';
import { stockManagementService } from '../services/stockManagementService';
import { categoryService } from '../services/categoryService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    StockManagementDTO,
    StockManagementFilters,
    StockUpdateDTO,
    StockLimitUpdateDTO,
    StockStatus
} from '../types/api/stockManagementInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';
import type { Paginated } from '../types/api/dashboardInterface';

interface StockManagementPageProps {
    onNavigate: (page: string, ) => void;
    stockFilter?: string;
}

const StockManagementPage: React.FC<StockManagementPageProps> = ({ stockFilter }) => {
    // Filter states - same pattern as ProductManagementPage
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [selectedStatus, setSelectedStatus] = useState<StockStatus | undefined>(
        stockFilter as StockStatus | undefined // Set initial status from prop
    );
    const [minStock, setMinStock] = useState<number>(0);
    const [maxStock, setMaxStock] = useState<number>(0);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [products, setProducts] = useState<Paginated<StockManagementDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Dropdown data
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);

    const [updatingStock, setUpdatingStock] = useState(false);
    const [updatingStockLimit, setUpdatingStockLimit] = useState(false);

    // Error handling
    const { generalError, clearErrors, handleApiError } = useFormErrorHandler();

    // Load categories - same pattern as ProductManagementPage
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await categoryService.getCategoriesForDropdown();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Load products when filters change
    useEffect(() => {
        searchProducts();
    }, [searchTerm, selectedCategoryId, selectedStatus, minStock, maxStock, currentPage, pageSize]);

    // Search products function
    const searchProducts = async () => {
        try {
            setLoading(true);
            clearErrors();

            const filters: StockManagementFilters = {
                nameOrCode: searchTerm.trim() || undefined,
                categoryId: selectedCategoryId,
                status: selectedStatus,
                minStock: minStock > 0 ? minStock : undefined,
                maxStock: maxStock > 0 ? maxStock : undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: 'name',
                sortDirection: 'ASC'
            };

            console.log('🔍 Searching with filters:', filters);
            const result = await stockManagementService.getProductsForStockManagement(filters);
            console.log('📦 Products result:', result);
            setProducts(result);
        } catch (error) {
            console.error('❌ Search error:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter handlers
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategoryId(undefined);
        setSelectedStatus(undefined);
        setMinStock(0);
        setMaxStock(0);
        setCurrentPage(0);
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    // Stock update handlers
    const handleSingleStockUpdate = async (product: StockManagementDTO, newStock: number) => {
        try {
            setUpdatingStock(true);
            clearErrors();

            const updateData: StockUpdateDTO = {
                productId: product.productId,
                updateType: 'SET',
                quantity: newStock
            };

            await stockManagementService.updateProductStock(updateData);
            await searchProducts(); // Refresh data
        } catch (error) {
            await handleApiError(error);
        } finally {
            setUpdatingStock(false);
        }
    };

    const handleStockLimitUpdate = async (product: StockManagementDTO, newStockLimit: number) => {
        try {
            setUpdatingStockLimit(true);
            clearErrors();

            const updateData: StockLimitUpdateDTO = {
                productId: product.productId,
                quantity: newStockLimit
            };

            await stockManagementService.updateProductStockLimit(updateData);
            await searchProducts();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setUpdatingStockLimit(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* General Error Display */}
                    {generalError && (
                        <Alert variant="error" className="mb-6">
                            {generalError}
                        </Alert>
                    )}

                    {/* Search and Results Card */}
                    <CustomCard className="shadow-lg">
                        <StockManagementFilterPanel
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            selectedCategoryId={selectedCategoryId}
                            onCategoryIdChange={setSelectedCategoryId}
                            selectedStatus={selectedStatus}
                            onStatusChange={setSelectedStatus}
                            minStock={minStock}
                            onMinStockChange={setMinStock}
                            maxStock={maxStock}
                            onMaxStockChange={setMaxStock}
                            categories={categories}
                            searchResults={products?.data || []}
                            loading={loading}
                            onClearFilters={handleClearFilters}
                            onUpdateStock={handleSingleStockUpdate}
                            updatingStock={updatingStock}
                            onUpdateStockLimit={handleStockLimitUpdate}
                            updatingStockLimit={updatingStockLimit}
                        />

                        {/* Pagination */}
                        {products && products.data && products.data.length > 0 && (
                            <div className="mt-6">
                                <EnhancedPaginationControls
                                    paginationData={{
                                        currentPage: products.currentPage,
                                        totalPages: products.totalPages,
                                        totalElements: products.totalElements,
                                        pageSize: products.pageSize,
                                        numberOfElements: products.numberOfElements
                                    }}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                                    loading={loading}
                                />
                            </div>
                        )}
                    </CustomCard>
                </div>
            </div>
        </div>
    );
};

export default StockManagementPage;