import React, { useState, useEffect } from 'react';
import { Button, Alert, CustomCard } from '../components/ui/common';
import { ConfirmDeleteModal, SuccessModal, SaleDetailModal, SaleUpdateModal } from '../components/ui/modals';
import { SaleFilterPanel } from '../components/ui/filterPanels'
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { saleService } from '../services/saleService';
import { locationService } from '../services/locationService';
import { categoryService } from '../services/categoryService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import {Plus, Calendar} from 'lucide-react';
import type {
    SaleReadOnlyDTO,
    SaleUpdateDTO,
    PaginatedFilteredSalesWithSummary,
    SaleFilters
} from '../types/api/saleInterface';
import type { PaymentMethodDTO } from '../types/api/recordSaleInterface';
import { SaleDetailedViewDTO } from '../types/api/saleInterface.ts';
import type { LocationForDropdownDTO } from '../types/api/locationInterface';
import type { CategoryForDropdownDTO } from '../types/api/categoryInterface';
import type { CustomerSearchResultDTO } from '../types/api/customerInterface';
import type { ProductSearchResultDTO } from '../types/api/productInterface';
import { formatCurrency, formatNumber, formatDate } from "../utils/formatters.ts";
import { DEFAULT_PAGE_SIZES } from "../constants/pagination.ts";

interface SaleManagementPageProps {
    onNavigate: (page: string) => void;
}

const SaleManagementPage: React.FC<SaleManagementPageProps> = ({ onNavigate }) => {
    // SEARCH AND FILTER STATE
    const [customerFilter, setCustomerFilter] = useState<CustomerSearchResultDTO | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResultDTO[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const [productFilter, setProductFilter] = useState<ProductSearchResultDTO | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productSearchResults, setProductSearchResults] = useState<ProductSearchResultDTO[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [locationFilter, setLocationFilter] = useState<number | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
    const [isWholesaleFilter, setIsWholesaleFilter] = useState<boolean | undefined>(undefined);
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    // DROPDOWN DATA
    const [locations, setLocations] = useState<LocationForDropdownDTO[]>([]);
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);

    // SEARCH RESULTS STATE
    const [searchResults, setSearchResults] = useState<PaginatedFilteredSalesWithSummary | null>(null);
    const [loading, setLoading] = useState(false);

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.SALES);

    // MODAL STATE
    const [selectedSale, setSelectedSale] = useState<SaleReadOnlyDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [saleDetails, setSaleDetails] = useState<SaleDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // ERROR AND SUCCESS HANDLING
    const { handleApiError } = useFormErrorHandler();
    const [successMessage, setSuccessMessage] = useState<{ title: string; message: string } | null>(null);

    // LOAD DROPDOWN DATA
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [locationsData, categoriesData, paymentMethodsData] = await Promise.all([
                    locationService.getActiveLocationsForDropdown(),
                    categoryService.getCategoriesForDropdown(),
                    saleService.getPaymentMethods()
                ]);

                setLocations(locationsData);
                setCategories(categoriesData);
                setPaymentMethods(paymentMethodsData);
            } catch (error) {
                console.error('Error loading dropdown data:', error);
                await handleApiError(error);
            }
        };

        loadDropdownData();
    }, []);

    // SEARCH SALES
    useEffect(() => {
        searchSales();
    }, [
        customerFilter,
        productFilter,
        locationFilter,
        categoryFilter,
        paymentMethodFilter,
        isWholesaleFilter,
        dateFromFilter,
        dateToFilter,
        currentPage,
        pageSize
    ]);

    const searchSales = async () => {
        try {
            setLoading(true);

            const filters: SaleFilters = {
                customerId: customerFilter?.id,
                productId: productFilter?.id,
                locationId: locationFilter,
                categoryId: categoryFilter,
                paymentMethod: paymentMethodFilter || undefined,
                isWholesale: isWholesaleFilter,
                saleDateFrom: dateFromFilter || undefined,
                saleDateTo: dateToFilter || undefined,
                page: currentPage,
                pageSize: pageSize,
                sortBy: 'saleDate',
                sortDirection: 'DESC'
            };

            const results = await saleService.searchSalesWithSummary(filters);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching sales:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // CUSTOMER SEARCH
    useEffect(() => {
        if (customerSearchTerm.trim().length >= 2) {
            const timeoutId = setTimeout(() => {
                searchCustomers(customerSearchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setCustomerSearchResults([]);
        }
    }, [customerSearchTerm]);

    const searchCustomers = async (term: string) => {
        try {
            setLoadingCustomers(true);
            const results = await customerService.searchCustomersForAutocomplete(term);
            setCustomerSearchResults(results);
        } catch (error) {
            console.error('Error searching customers:', error);
            setCustomerSearchResults([]);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handlePaymentMethodFilterChange = (value: string | number) => {
        const stringValue = typeof value === 'number' ? String(value) : value;
        setPaymentMethodFilter(stringValue);
    };

    // PRODUCT SEARCH
    useEffect(() => {
        if (productSearchTerm.trim().length >= 2) {
            const timeoutId = setTimeout(() => {
                searchProducts(productSearchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setProductSearchResults([]);
        }
    }, [productSearchTerm]);

    const searchProducts = async (term: string) => {
        try {
            setLoadingProducts(true);
            const results = await productService.searchProductsForAutocomplete(term);
            setProductSearchResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
            setProductSearchResults([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    // EVENT HANDLERS
    const handleViewDetails = async (sale: SaleReadOnlyDTO) => {
        console.log('Opening sale details for sale:', sale); // Debug log
        try {
            setSelectedSale(sale);
            setIsDetailModalOpen(true);
            setDetailsLoading(true);
            setSaleDetails(null); // Clear previous details

            console.log('Fetching sale details for ID:', sale.id); // Debug log
            const details = await saleService.getSaleDetailedView(sale.id);
            console.log('Received sale details:', details); // Debug log

            setSaleDetails(details);
        } catch (error) {
            console.error('Error loading sale details:', error);

            // Close modal on error and show error message
            setIsDetailModalOpen(false);
            setSelectedSale(null);
            setSaleDetails(null);

            await handleApiError(error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEdit = (sale: SaleReadOnlyDTO) => {
        setSelectedSale(sale);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (sale: SaleReadOnlyDTO) => {
        setSelectedSale(sale);
        setIsDeleteModalOpen(true);
    };

    const handleUpdateSale = async (saleData: SaleUpdateDTO) => {
        try {
            await saleService.updateSale(saleData.saleId, saleData);
            setIsUpdateModalOpen(false);
            setSuccessMessage({
                title: 'Επιτυχής Ενημέρωση',
                message: `Η πώληση ενημερώθηκε επιτυχώς.`
            });
            await searchSales();
        } catch (error) {
            console.error('Error updating sale:', error);
            throw error; // Let the modal handle the error
        }
    };

    const handleDeleteSale = async () => {
        if (!selectedSale) return;

        try {
            await saleService.deleteSale(selectedSale.id);
            setIsDeleteModalOpen(false);
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Η πώληση διαγράφηκε επιτυχώς.`
            });
            await searchSales();
        } catch (error) {
            console.error('Error deleting sale:', error);
            await handleApiError(error);
        }
    };

    return (
            <div className="min-h-screen p-4">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Success Alert */}
                    {successMessage && (
                        <Alert
                            variant="success"
                            title={successMessage.title}
                            onClose={() => setSuccessMessage(null)}
                        />
                    )}

                    {/* Header - Mobile responsive */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                        </div>
                        <Button
                            onClick={() => onNavigate('record-sale')}
                            variant="create"
                            size="lg"
                            className={"w-full md:w-auto"}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Νέα Πώληση
                        </Button>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard
                        className="shadow-lg"
                    >
                        <SaleFilterPanel
                            // Customer filter
                            customerSearchTerm={customerSearchTerm}
                            onCustomerSearchTermChange={setCustomerSearchTerm}
                            customerSearchResults={customerSearchResults}
                            selectedCustomer={customerFilter}
                            onCustomerSelect={setCustomerFilter}
                            loadingCustomers={loadingCustomers}

                            // Product filter
                            productSearchTerm={productSearchTerm}
                            onProductSearchTermChange={setProductSearchTerm}
                            productSearchResults={productSearchResults}
                            selectedProduct={productFilter}
                            onProductSelect={setProductFilter}
                            loadingProducts={loadingProducts}

                            // Location filter
                            selectedLocationId={locationFilter}
                            onLocationIdChange={setLocationFilter}
                            locations={locations}

                            // Category filter
                            selectedCategoryId={categoryFilter}
                            onCategoryIdChange={setCategoryFilter}
                            categories={categories}

                            // Payment method filter
                            paymentMethodFilter={paymentMethodFilter}
                            onPaymentMethodFilterChange={handlePaymentMethodFilterChange}
                            paymentMethods={paymentMethods}

                            isWholesaleFilter={isWholesaleFilter}
                            onIsWholesaleFilterChange={setIsWholesaleFilter}

                            // Date filters
                            dateFromFilter={dateFromFilter}
                            onDateFromFilterChange={setDateFromFilter}
                            dateToFilter={dateToFilter}
                            onDateToFilterChange={setDateToFilter}

                            // Results and actions
                            searchResults={searchResults?.data || []}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        >
                            {/* Summary Card */}
                            {searchResults?.summary && (
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                        Σύνοψη Αποτελεσμάτων
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatNumber(searchResults.summary.totalSalesCount)}
                                            </div>
                                            <div className="text-sm text-gray-600">Συνολικες Πωλήσεις</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatCurrency(searchResults.summary.totalRevenue)}
                                            </div>
                                            <div className="text-sm text-gray-600">Συνολικά Έσοδα</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {formatCurrency(searchResults.summary.averageOrderValue)}
                                            </div>
                                            <div className="text-sm text-gray-600">Μέσος Όρος Πώλησης</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {`${searchResults.summary.averageDiscountPercentage}%`}
                                            </div>
                                            <div className="text-sm text-gray-600">Μέση Έκπτωση ανα Πώληση</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {formatCurrency(searchResults.summary.totalDiscountAmount)}
                                            </div>
                                            <div className="text-sm text-gray-600">Σύνολικό Πόσο Εκπτώσεων</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No Summary Warning */}
                            {searchResults && !searchResults.summary && searchResults.totalElements > 100 && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <strong>Πάρα πολλά αποτελέσματα για σύνοψη:</strong> Βρέθηκαν {formatNumber(searchResults.totalElements)} πωλήσεις.
                                                Η σύνοψη εμφανίζεται μόνο για ≤100 αποτελέσματα για λόγους απόδοσης.
                                            </p>
                                            <p className="text-sm text-yellow-600">
                                                💡 <strong>Συμβουλή:</strong> Περιορίστε τα φίλτρα σας (π.χ. ημερομηνίες, κατηγορίες, προϊόντα ) για να δείτε τη σύνοψη.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </SaleFilterPanel>
                    </CustomCard>

                    {/* Pagination */}
                    {searchResults && searchResults.totalElements > 0 && (
                        <CustomCard title="" className="shadow-lg">
                            <div className="w-full overflow-x-auto">
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
                            </div>
                        </CustomCard>
                    )}
                    </div>

                    {/* Modals */}
                        {selectedSale && (
                            <>
                                <SaleDetailModal
                                    isOpen={isDetailModalOpen}
                                    onClose={() => {
                                        console.log('Closing sale detail modal'); // Debug log
                                        setIsDetailModalOpen(false);
                                        setSaleDetails(null);
                                        setSelectedSale(null);
                                    }}
                                    saleDetails={saleDetails}
                                    loading={detailsLoading}
                                />

                                <SaleUpdateModal
                                    isOpen={isUpdateModalOpen}
                                    onClose={() => {
                                        setIsUpdateModalOpen(false);
                                        setSelectedSale(null);
                                    }}
                                    sale={selectedSale}
                                    locations={locations}
                                    paymentMethods={paymentMethods}
                                    onUpdate={handleUpdateSale}
                                />

                                <ConfirmDeleteModal
                                    isOpen={isDeleteModalOpen}
                                    title="Επιβεβαίωση Διαγραφής Πώλησης"
                                    message={`Είστε σίγουροι ότι θέλετε να διαγράψετε την πώληση στις ${formatDate(selectedSale.saleDate)} για ${formatCurrency(selectedSale.finalTotalPrice)}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`}
                                    onConfirm={handleDeleteSale}
                                    onClose={() => {
                                        setIsDeleteModalOpen(false);
                                        setSelectedSale(null);
                                    }}
                                />
                            </>
                        )}

                    {/* Success Modal */}
                    <SuccessModal
                        isOpen={!!successMessage}
                        title={successMessage?.title || ''}
                        message={successMessage?.message || ''}
                        onClose={() => setSuccessMessage(null)}
                    />
            </div>
            </div>
    );
};

export default SaleManagementPage;