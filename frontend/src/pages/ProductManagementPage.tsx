// ProductManagementPage.tsx - Following CustomerManagementPage pattern

import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';
import { productService } from '../services/productService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Package, Plus, Search } from 'lucide-react';
import type {
    ProductListItemDTO,
    ProductInsertDTO,
    ProductUpdateDTO
} from '../types/api/productInterface';
import type { Paginated } from '../types/api/dashboardInterface';

// Import product-specific components (these will need to be created following the same patterns)
import ProductSearchBar from '../components/ui/searchBars/ProductSearchBar';

const ProductManagementPage = () => {
    // Search and pagination state - following customer pattern
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [materialName, setMaterialName] = useState('');
    const [selectedProcedureId, setSelectedProcedureId] = useState<number | undefined>(undefined);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [stockStatus, setStockStatus] = useState('');
    const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<Paginated<ProductListItemDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Dropdown data
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [procedures, setProcedures] = useState<{ id: number; name: string }[]>([]);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected product and details
    const [selectedProduct, setSelectedProduct] = useState<ProductListItemDTO | null>(null);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({
        title: '',
        message: ''
    });


    // Search function
    const searchProducts = async (page: number = currentPage, size: number = pageSize) => {
        setLoading(true);
        clearErrors();

        try {
            // If search term is less than 2 characters and not empty, don't search
            if (searchTerm.length > 0 && searchTerm.length < 2) {
                setLoading(false);
                return;
            }


            const data = await productService.getProductsFilteredPaginated(
                searchTerm.trim() || undefined,
                selectedCategoryId,
                selectedProcedureId,
                materialName.trim() || undefined,
                undefined, // materialId
                minPrice ? parseFloat(minPrice) : undefined,
                maxPrice ? parseFloat(maxPrice) : undefined,
                undefined, // stockStatus string not used, we use lowStock/minStock/maxStock
                isActive,
                'name', // sortBy
                'ASC', // sortDirection
                page,
                size
            );

            setSearchResults(data);
        } catch (err) {
            await handleApiError(err);
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Load dropdown data
    const loadDropdownData = async () => {
        try {
            const [categoriesData, proceduresData] = await Promise.all([
                productService.getProductCategories(),
                // We'll need to create a method to get procedures for dropdown
                // For now, use empty array
                Promise.resolve([])
            ]);
            setCategories(categoriesData);
            setProcedures(proceduresData);
        } catch (err) {
            console.error('Error loading dropdown data:', err);
        }
    };

    // Load initial data
    useEffect(() => {
        loadDropdownData();
        searchProducts();
    }, []);

    // Debounced search when search parameters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Reset to page 0 when search changes
            setCurrentPage(0);
            searchProducts(0, pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [
        searchTerm,
        selectedCategoryId,
        materialName,
        selectedProcedureId,
        minPrice,
        maxPrice,
        stockStatus,
        activeOnlyFilter
    ]);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        searchProducts(page, pageSize);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page
        searchProducts(0, newPageSize);
    };

    // Modal handler

    const handleEdit = (product: ProductListItemDTO) => {
        setSelectedProduct(product);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (product: ProductListItemDTO) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };


    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        try {
            await productService.deleteProduct(Number(selectedProduct.id));
            await searchProducts(); // Refresh results
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Το προϊόν "${selectedProduct.name}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            // Keep error handling for delete since it's not in a modal with useFormErrorHandler
            await handleApiError(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Προϊόντων</h1>
                            <p className="text-gray-600">Αναζήτηση και διαχείριση προϊόντων κοσμημάτων</p>
                        </div>
                    </div>

                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                {/* Pagination Controls - Top */}
                {searchResults && searchResults.totalElements > 0 && (
                    <EnhancedPaginationControls
                        paginationData={{
                            currentPage: searchResults.currentPage,
                            totalPages: searchResults.totalPages,
                            totalElements: searchResults.totalElements,
                            pageSize: searchResults.pageSize,
                            numberOfElements: searchResults.numberOfElements
                        }}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                    />
                )}

                {/* Search Section */}
                <DashboardCard
                    title="Αναζήτηση Προϊόντων"
                    icon={<Search className="w-5 h-5" />}
                    className="shadow-lg border-white/20"
                >
                    <ProductSearchBar
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        selectedCategoryId={selectedCategoryId}
                        onCategoryIdChange={setSelectedCategoryId}
                        categories={categories}
                        materialName={materialName}
                        onMaterialNameChange={setMaterialName}
                        selectedProcedureId={selectedProcedureId}
                        onProcedureIdChange={setSelectedProcedureId}
                        procedures={procedures}
                        minPrice={minPrice}
                        onMinPriceChange={setMinPrice}
                        maxPrice={maxPrice}
                        onMaxPriceChange={setMaxPrice}
                        stockStatus={stockStatus}
                        onStockStatusChange={setStockStatus}
                        activeOnlyFilter={activeOnlyFilter}
                        onActiveOnlyFilterChange={setActiveOnlyFilter}
                        searchResults={searchResults ? searchResults.data : []}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </DashboardCard>

                {/* Pagination Controls - Bottom */}
                {searchResults && searchResults.totalElements > 0 && (
                    <EnhancedPaginationControls
                        paginationData={{
                            currentPage: searchResults.currentPage,
                            totalPages: searchResults.totalPages,
                            totalElements: searchResults.totalElements,
                            pageSize: searchResults.pageSize,
                            numberOfElements: searchResults.numberOfElements
                        }}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                    />
                )}
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProduct}
                title="Διαγραφή Προϊόντος"
                message={selectedProduct ?
                    `Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "${selectedProduct.name}";`
                    : ''
                }
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Το προϊόν θα διαγραφεί οριστικά ή θα απενεργοποιηθεί εάν έχει ιστορικό πωλήσεων."
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title={successMessage.title}
                message={successMessage.message}
            />
        </div>
    );
};

export default ProductManagementPage;