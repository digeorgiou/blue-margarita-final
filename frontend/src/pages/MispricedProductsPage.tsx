import React, { useState, useEffect, useMemo } from 'react';
import { Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';
import MispricedProductFilterPanel from '../components/ui/filterPanels/MispricedProductFilterPanel.tsx';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {
    MispricedProductAlertDTO
} from '../types/api/dashboardInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';

interface MispricedProductsPageProps {
    onNavigate: (page: string) => void;
}

const MispricedProductsPage: React.FC<MispricedProductsPageProps> = () => {
    // Raw data from backend
    const [allProducts, setAllProducts] = useState<MispricedProductAlertDTO[]>([]);
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [updatingRetailPrice, setUpdatingRetailPrice] = useState(false);
    const [updatingWholesalePrice, setUpdatingWholesalePrice] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [selectedIssueType, setSelectedIssueType] = useState<string | undefined>(undefined);
    const [thresholdPercentage, setThresholdPercentage] = useState(20);

    // Pagination states (for frontend pagination)
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(9);

    // Error handling
    const { generalError, clearErrors, handleApiError } = useFormErrorHandler();

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadAllMispricedProducts();
    }, []);

    // Frontend filtering and pagination using useMemo
    const { paginatedProducts, totalPages, totalElements } = useMemo(() => {
        let filtered = [...allProducts];

        // Apply threshold filter
        filtered = filtered.filter(product =>
            product.priceDifferencePercentage >= thresholdPercentage
        );

        // Apply search term filter (name or code)
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.productName.toLowerCase().includes(search) ||
                product.productCode.toLowerCase().includes(search)
            );
        }

        // Apply category filter
        if (selectedCategoryId) {
            filtered = filtered.filter(product => product.categoryId === selectedCategoryId);
        }

        // Apply issue type filter
        if (selectedIssueType) {
            filtered = filtered.filter(product => product.issueType === selectedIssueType);
        }

        // Sort by price difference percentage (descending)
        filtered.sort((a, b) => b.priceDifferencePercentage - a.priceDifferencePercentage);

        // Calculate pagination
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / pageSize);
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProducts = filtered.slice(startIndex, endIndex);

        return {
            filteredProducts: filtered,
            paginatedProducts,
            totalPages,
            totalElements
        };
    }, [
        allProducts,
        searchTerm,
        selectedCategoryId,
        selectedIssueType,
        thresholdPercentage,
        currentPage,
        pageSize,
        categories
    ]);

    const loadCategories = async () => {
        try {
            const result = await categoryService.getCategoriesForDropdown();
            setCategories(result);
        } catch (error) {
            console.error('❌ Load categories error:', error);
            await handleApiError(error);
        }
    };

    const loadAllMispricedProducts = async () => {
        try {
            setLoading(true);
            clearErrors();

            const result = await productService.getAllMispricedProducts({
                thresholdPercentage: 15, // Low threshold to get all potential mispriced products
                page: 0,
                pageSize: 1000, // Large page size to get all data
                sortBy: 'priceDifferencePercentage',
                sortDirection: 'DESC'
            });

            console.log('📦 All mispriced products loaded:', result);
            setAllProducts(result.data || []);
        } catch (error) {
            console.error('❌ Load error:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter handlers
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategoryId(undefined);
        setSelectedIssueType(undefined);
        setThresholdPercentage(20);
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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, selectedCategoryId, selectedIssueType, thresholdPercentage]);

    // Price update handlers
    const handleRetailPriceUpdate = async (product: MispricedProductAlertDTO, newPrice: number) => {
        try {
            setUpdatingRetailPrice(true);
            clearErrors();

            await productService.updateFinalRetailPrice(product.productId, newPrice, 1);

            // Refresh all data after update
            await loadAllMispricedProducts();

        } catch (error) {
            await handleApiError(error);
        } finally {
            setUpdatingRetailPrice(false);
        }
    };

    const handleWholesalePriceUpdate = async (product: MispricedProductAlertDTO, newPrice: number) => {
        try {
            setUpdatingWholesalePrice(true);
            clearErrors();

            await productService.updateFinalWholesalePrice(product.productId, newPrice, 1);

            // Refresh all data after update
            await loadAllMispricedProducts();

        } catch (error) {
            await handleApiError(error);
        } finally {
            setUpdatingWholesalePrice(false);
        }
    };

    // Utility functions
    const formatMoney = (amount: number): string => {
        return `€${amount.toFixed(2)}`;
    };

    const getPricingIssueTypeLabel = (issueType: string): string => {
        switch (issueType) {
            case 'BOTH_UNDERPRICED':
                return 'Χαμηλή Λιανική & Χονδρική';
            case 'RETAIL_UNDERPRICED':
                return 'Χαμηλή Λιανική Τιμή';
            case 'WHOLESALE_UNDERPRICED':
                return 'Χαμηλή Χονδρική Τιμή';
            default:
                return issueType;
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                    </div>

                    {/* General Error Display */}
                    {generalError && (
                        <Alert variant="error" className="mb-6">
                            {generalError}
                        </Alert>
                    )}

                    {/* Search and Results Card */}
                    <CustomCard className="shadow-lg">
                        <MispricedProductFilterPanel
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            selectedCategoryId={selectedCategoryId}
                            onCategoryIdChange={setSelectedCategoryId}
                            selectedIssueType={selectedIssueType}
                            onIssueTypeChange={setSelectedIssueType}
                            thresholdPercentage={thresholdPercentage}
                            onThresholdPercentageChange={setThresholdPercentage}
                            categories={categories}
                            searchResults={paginatedProducts}
                            loading={loading}
                            onClearFilters={handleClearFilters}
                            onUpdateRetailPrice={handleRetailPriceUpdate}
                            onUpdateWholesalePrice={handleWholesalePriceUpdate}
                            updatingRetailPrice={updatingRetailPrice}
                            updatingWholesalePrice={updatingWholesalePrice}
                            formatMoney={formatMoney}
                            getPricingIssueTypeLabel={getPricingIssueTypeLabel}
                        />

                        {/* Pagination */}
                        {totalElements > 0 && (
                            <div className="mt-6">
                                <EnhancedPaginationControls
                                    paginationData={{
                                        currentPage: currentPage,
                                        totalPages: totalPages,
                                        totalElements: totalElements,
                                        pageSize: pageSize,
                                        numberOfElements: paginatedProducts.length
                                    }}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                                />
                            </div>
                        )}
                    </CustomCard>
                </div>
            </div>
        </div>
    );
};

export default MispricedProductsPage;