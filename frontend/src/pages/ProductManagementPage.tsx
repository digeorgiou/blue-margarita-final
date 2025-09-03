import React, { useState, useEffect } from 'react';
import { Package, Plus, Calculator } from 'lucide-react';
import { Button, Alert, CustomCard } from '../components/ui/common';
import { ConfirmDeleteModal, SuccessModal, PriceRecalculationResultModal, PriceRecalculationConfirmModal } from '../components/ui/modals';
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { ProductFilterPanel } from '../components/ui/filterPanels'
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { procedureService } from '../services/procedureService';
import { materialService } from '../services/materialService';
import { authService } from '../services/authService';
import { CustomToggleOption } from '../components/ui/inputs';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import type {ProductDetailedViewDTO, ProductListItemDTO} from '../types/api/productInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';
import type { ProcedureForDropdownDTO } from '../types/api/procedureInterface';
import type { MaterialSearchResultDTO } from '../types/api/materialInterface';
import type { Paginated } from '../types/api/dashboardInterface';
import {ProductDetailModal} from "../components/ui/modals";
import { PriceRecalculationResultDTO } from "../types/api/productInterface";
import { DEFAULT_PAGE_SIZES } from "../constants/pagination.ts";

interface ProductManagementPageProps {
    onNavigate: (page: string, options?: {
        productId?: string;
        stockFilter?: string;
        successMessage?: string;
    }) => void;
    successMessage?: string;
}

const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
                                                                         onNavigate,
                                                                         successMessage: passedSuccessMessage
                                                                     }) => {
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialSearchResultDTO | null>(null);
    const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
    const [selectedProcedure, setSelectedProcedure] = useState<ProcedureForDropdownDTO | null>(null);
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [minStock, setMinStock] = useState<number>(0);
    const [maxStock, setMaxStock] = useState<number>(0);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(0);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.PRODUCTS);
    const [searchResults, setSearchResults] = useState<Paginated<ProductListItemDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

    // Dropdown data
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);
    const [procedureSearchResults, setProcedureSearchResults] = useState<ProcedureForDropdownDTO[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingProcedures, setLoadingProcedures] = useState(false);

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductListItemDTO | null>(null);
    const [productDetails, setProductDetails] = useState<ProductDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    const [isRecalculating, setIsRecalculating] = useState(false);
    const [isRecalculationConfirmOpen, setIsRecalculationConfirmOpen] = useState(false);
    const [isRecalculationModalOpen, setIsRecalculationModalOpen] = useState(false);
    const [recalculationResult, setRecalculationResult] = useState<PriceRecalculationResultDTO | null>(null);

    const [isAdmin, setIsAdmin] = useState(false);


    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Initialize data
    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (passedSuccessMessage && passedSuccessMessage.startsWith('SUCCESS_')) {
            const [operation, productName] = passedSuccessMessage.split(':');

            if (operation === 'SUCCESS_CREATE') {
                setSuccessMessage({
                    title: 'Επιτυχής Δημιουργία',
                    message: `Το προϊόν "${productName}" δημιουργήθηκε επιτυχώς.`
                });
                setIsSuccessModalOpen(true);
            } else if (operation === 'SUCCESS_UPDATE') {
                setSuccessMessage({
                    title: 'Επιτυχής Ενημέρωση',
                    message: `Το προϊόν "${productName}" ενημερώθηκε επιτυχώς.`
                });
                setIsSuccessModalOpen(true);
            }

            // Refresh the product list to show the changes
            performSearch();
        }
    }, [passedSuccessMessage]);

    // Load initial dropdown data
    const loadInitialData = async () => {
        try {
            setLoading(true);
            const categoriesData = await categoryService.getCategoriesForDropdown();
            setCategories(categoriesData);

            // Perform initial search
            await performSearch();
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Perform search with current filters
    const performSearch = async () => {
        setLoading(true);
        clearErrors();

        try {
            const results = await productService.getProductsFilteredPaginated(
                searchTerm || undefined,
                selectedCategoryId || undefined,
                selectedProcedure?.id || undefined,
                selectedMaterial?.materialName || undefined,
                selectedMaterial?.materialId || undefined,
                minPrice > 0 ? minPrice : undefined,
                maxPrice > 0 ? maxPrice : undefined,
                minStock > 0 ? minStock : undefined,
                maxStock > 0 ? maxStock : undefined,
                showInactiveOnly ? false : true,
                lowStockOnly || undefined,
                'name', // sortBy
                'ASC', // sortDirection
                currentPage,
                pageSize
            );
            setSearchResults(results);
        } catch (error) {
            handleApiError(error);
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Search for materials
    const searchMaterials = async (term: string) => {
        if (term.length < 2) {
            setMaterialSearchResults([]);
            return;
        }

        setLoadingMaterials(true);

        try {
            const materials = await materialService.searchMaterialsForAutocomplete(term);
            setMaterialSearchResults(materials);
        } catch (error) {
            console.error('Error searching materials:', error);
            setMaterialSearchResults([]);
        } finally {
            setLoadingMaterials(false);
        }
    };

    const handleToggleChange = (checked: boolean) => {
        setShowInactiveOnly(checked);
        setCurrentPage(0); // Reset to first page when toggle changes
    };

    // Search for procedures
    const searchProcedures = async (term: string) => {
        if (term.length < 2) {
            setProcedureSearchResults([]);
            return;
        }

        setLoadingProcedures(true);

        try {
            const procedures = await procedureService.searchProceduresForAutocomplete(term);
            setProcedureSearchResults(procedures);
        } catch (error) {
            console.error('Error searching procedures:', error);
            setProcedureSearchResults([]);
        } finally {
            setLoadingProcedures(false);
        }
    };

    // Handle search when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategoryId, selectedProcedure, selectedMaterial, lowStockOnly, minStock, maxStock, minPrice, maxPrice, currentPage, pageSize]);

    // Handle material search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchMaterials(materialSearchTerm);
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [materialSearchTerm]);

    // Handle procedure search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchProcedures(procedureSearchTerm);
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [procedureSearchTerm]);

    useEffect(() => {
        const userRole = authService.getCurrentUserRole();
        setIsAdmin(userRole === 'ADMIN');
    }, []);

// 6. Add this useEffect to reload when toggle changes (add after existing useEffects):
    useEffect(() => {
        performSearch();
    }, [showInactiveOnly]);

    // Handle view details - Load detailed product data and open modal
    const handleViewDetails = async (product: ProductListItemDTO) => {
        try {
            setSelectedProduct(product);
            setIsDetailsModalOpen(true);
            setDetailsLoading(true);

            const details = await productService.getProductDetails(Number(product.id));
            setProductDetails(details);
        } catch (error) {
            console.error('Error loading product details:', error);
            await handleApiError(error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleAnalytics = (product: ProductListItemDTO) => {
        onNavigate('product-sales-analytics', { productId: product.id });
    };

    const handleEdit = (product: ProductListItemDTO) => {
        onNavigate('update-product', { productId: product.id });
    };

    const handleCreateProduct = () => {
        onNavigate('create-product');
    };

    const handleDelete = (product: ProductListItemDTO) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const handleRecalculateAllPrices = async () => {
        try {
            setIsRecalculating(true);
            setIsRecalculationConfirmOpen(false); // Close confirm modal
            clearErrors();

            const result = await productService.recalculateAllProductPrices();
            setRecalculationResult(result);
            setIsRecalculationModalOpen(true);

        } catch (err) {
            await handleApiError(err);
        } finally {
            setIsRecalculating(false);
        }
    };

    const showRecalculationConfirm = () => {
        setIsRecalculationConfirmOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        try {
            await productService.deleteProduct(Number(selectedProduct.id));
            setIsDeleteModalOpen(false);
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Το προϊόν "${selectedProduct.name}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
            // Refresh search results
            await performSearch();
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleRestoreProduct = async (product: ProductListItemDTO) => {
        try {
            await productService.restoreProduct(Number(product.id));
            await performSearch(); // Reload the list
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: `Το προϊόν "${product.name}" επαναφέρθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            await handleApiError(error);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Error Display */}
                {generalError && (
                    <Alert variant="error">
                        {generalError}
                    </Alert>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                        {isAdmin && (
                            <CustomToggleOption
                                value={showInactiveOnly}
                                onChange={handleToggleChange}
                                optionLabel="Προβολή Ανενεργών"
                                className=""
                                textClassName="text-white"
                            />
                        )}
                    </div>

                    <Button
                        onClick={showRecalculationConfirm}
                        variant="warning"
                        size="md"
                        disabled={isRecalculating || loading}
                        className="flex items-center space-x-2"
                        title="Επανυπολογισμός όλων των προτεινόμενων τιμών προϊόντων βάσει τρεχόντων κοστών"
                    >
                        <Calculator className="w-4 h-4" />
                        <span>Επανυπολογισμός Τιμών</span>
                    </Button>

                    <Button
                        onClick={handleCreateProduct}
                        variant="create"
                        size="lg">
                        <Plus className="w-5 h-5" />
                        Νέο Προϊόν
                    </Button>
                </div>

                {/* Search and Filter Section */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard
                        className="shadow-lg"
                    >
                        <ProductFilterPanel
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            selectedCategoryId={selectedCategoryId}
                            onCategoryIdChange={setSelectedCategoryId}
                            categories={categories}
                            materialSearchTerm={materialSearchTerm}
                            onMaterialSearchTermChange={setMaterialSearchTerm}
                            materialSearchResults={materialSearchResults}
                            selectedMaterial={selectedMaterial}
                            onMaterialSelect={(material) => {
                                console.log('Material selected:', material);
                                setSelectedMaterial(material);
                                if (material) {
                                    setMaterialSearchTerm(material.materialName);
                                } else {
                                    setMaterialSearchTerm('');
                                }
                            }}
                            loadingMaterials={loadingMaterials}
                            procedureSearchTerm={procedureSearchTerm}
                            onProcedureSearchTermChange={setProcedureSearchTerm}
                            procedureSearchResults={procedureSearchResults}
                            selectedProcedure={selectedProcedure}
                            onProcedureSelect={(procedure) => {
                                console.log('Procedure selected:', procedure);
                                setSelectedProcedure(procedure);
                                if (procedure) {
                                    setProcedureSearchTerm(procedure.name);
                                } else {
                                    setProcedureSearchTerm('');
                                }
                            }}
                            loadingProcedures={loadingProcedures}
                            lowStockOnly={lowStockOnly}
                            onLowStockOnlyChange={setLowStockOnly}
                            minStock={minStock}
                            onMinStockChange={setMinStock}
                            maxStock={maxStock}
                            onMaxStockChange={setMaxStock}
                            minPrice={minPrice}
                            onMinPriceChange={setMinPrice}
                            maxPrice={maxPrice}
                            onMaxPriceChange={setMaxPrice}
                            searchResults={searchResults?.data || []}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAnalytics={handleAnalytics}
                            showInactiveOnly={showInactiveOnly}
                            onRestore={showInactiveOnly ? handleRestoreProduct : undefined}
                        >
                        </ProductFilterPanel>
                    </CustomCard>


                    {/* Pagination Controls */}
                    {searchResults && searchResults.totalPages > 0 && (
                        <CustomCard title="Σελιδοποίηση" icon={<Package className="w-5 h-5" />}>
                            <EnhancedPaginationControls
                                paginationData={{
                                    currentPage: searchResults.currentPage,
                                    totalPages: searchResults.totalPages,
                                    totalElements: searchResults.totalElements,
                                    pageSize: searchResults.pageSize,
                                    numberOfElements: searchResults.numberOfElements
                                }}
                                setCurrentPage={setCurrentPage}
                                setPageSize={setPageSize}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                            />
                        </CustomCard>
                    )}
                </div>

                {/* Modals */}
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteProduct}
                    title="Διαγραφή Προϊόντος"
                    message={selectedProduct ?
                        `Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "${selectedProduct.name}";`
                        : ''
                    }
                    warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
                />

                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    title={successMessage.title}
                    message={successMessage.message}
                />

                {/* Product Detail Modal */}
                <ProductDetailModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setProductDetails(null);
                        setSelectedProduct(null);
                    }}
                    product={productDetails}
                    loading={detailsLoading}
                />

                <PriceRecalculationConfirmModal
                    isOpen={isRecalculationConfirmOpen}
                    onClose={() => setIsRecalculationConfirmOpen(false)}
                    onConfirm={handleRecalculateAllPrices}
                    isLoading={isRecalculating}
                />

                <PriceRecalculationResultModal
                    isOpen={isRecalculationModalOpen}
                    onClose={() => setIsRecalculationModalOpen(false)}
                    result={recalculationResult}
                />

            </div>
        </div>
    );
};

export default ProductManagementPage;