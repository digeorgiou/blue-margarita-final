import React, { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import { purchaseService } from '../services/purchaseService';
import { supplierService } from '../services/supplierService';
import { materialService } from '../services/materialService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, Calendar } from 'lucide-react';
import type {
    PurchaseReadOnlyDTO,
    PurchaseUpdateDTO,
    PaginatedFilteredPurchasesWithSummary,
    PurchaseFilters,
    PurchaseDetailedViewDTO
} from '../types/api/purchaseInterface';
import type { SupplierSearchResultDTO } from '../types/api/supplierInterface';
import type { MaterialSearchResultDTO } from '../types/api/materialInterface';

import PurchaseFilterPanel from '../components/ui/filterPanels/PurchaseFilterPanel';
import PurchaseDetailModal from '../components/ui/modals/purchase/PurchaseDetailModal';
import PurchaseUpdateModal from '../components/ui/modals/purchase/PurchaseUpdateModal';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';

interface PurchaseManagementPageProps {
    onNavigate: (page: string) => void;
}

const PurchaseManagementPage: React.FC<PurchaseManagementPageProps> = ({ onNavigate }) => {
    // SEARCH AND FILTER STATE
    const [supplierFilter, setSupplierFilter] = useState<SupplierSearchResultDTO | null>(null);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [supplierSearchResults, setSupplierSearchResults] = useState<SupplierSearchResultDTO[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    const [materialFilter, setMaterialFilter] = useState<MaterialSearchResultDTO | null>(null);
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [materialSearchResults, setMaterialSearchResults] = useState<MaterialSearchResultDTO[]>([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    // DATE FILTERS
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // PURCHASE RESULTS AND MODAL STATE
    const [searchResults, setSearchResults] = useState<PaginatedFilteredPurchasesWithSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseReadOnlyDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // SUCCESS AND ERROR HANDLING
    const [successMessage, setSuccessMessage] = useState<{ title: string; message: string } | null>(null);
    const { handleApiError } = useFormErrorHandler();

    // SEARCH EFFECT FOR SUPPLIERS

    useEffect(() => {
        if (supplierSearchTerm.trim().length>= 2){
            const timeoutId = setTimeout(() => {
                searchSuppliers(supplierSearchTerm);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setSupplierSearchResults([]);
        }
    }, [supplierSearchTerm]);


    const searchSuppliers = async (term: string) => {
           try {
               setLoadingSuppliers(true);
               const results = await supplierService.searchSuppliersForAutocomplete(term);
               setSupplierSearchResults(results);
           } catch (error) {
                console.error('Error searching suppliers:', error);
                setSupplierSearchResults([]);
           } finally {
                setLoadingSuppliers(false);
           }
    };

    // SEARCH EFFECT FOR MATERIALS
    useEffect(() => {
        const searchMaterials = async () => {
            if (materialSearchTerm.trim().length >= 2) {
                setLoadingMaterials(true);
                try {
                    const results = await materialService.searchMaterialsForAutocomplete(materialSearchTerm.trim());
                    setMaterialSearchResults(results);
                } catch (error) {
                    console.error('Error searching materials:', error);
                    setMaterialSearchResults([]);
                } finally {
                    setLoadingMaterials(false);
                }
            } else {
                setMaterialSearchResults([]);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            searchMaterials();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [materialSearchTerm]);

    // SEARCH PURCHASES EFFECT
    useEffect(() => {
        searchPurchases();
    }, [currentPage, pageSize, supplierFilter, materialFilter, dateFromFilter, dateToFilter]);

    const searchPurchases = async () => {
        setLoading(true);
        try {
            const filters: PurchaseFilters = {
                page: currentPage,
                pageSize: pageSize,
                sortBy: 'purchaseDate',
                sortDirection: 'desc'
            };

            // Add filters
            if (supplierFilter) {
                filters.supplierId = supplierFilter.supplierId;
            }
            if (materialFilter) {
                filters.materialId = materialFilter.materialId;
            }
            if (dateFromFilter) {
                filters.purchaseDateFrom = dateFromFilter;
            }
            if (dateToFilter) {
                filters.purchaseDateTo = dateToFilter;
            }

            const results = await purchaseService.searchPurchasesWithSummary(filters);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching purchases:', error);
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (purchase: PurchaseReadOnlyDTO) => {
        setSelectedPurchase(purchase);
        setDetailsLoading(true);
        setIsDetailModalOpen(true);

        try {
            const details = await purchaseService.getPurchaseDetailedView(purchase.id);
            setPurchaseDetails(details);
        } catch (error) {
            console.error('Error fetching purchase details:', error);
            await handleApiError(error);
            setIsDetailModalOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEdit = (purchase: PurchaseReadOnlyDTO) => {
        setSelectedPurchase(purchase);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteRequest = (purchase: PurchaseReadOnlyDTO) => {
        setSelectedPurchase(purchase);
        setIsDeleteModalOpen(true);
    };

    const handleUpdatePurchase = async (updateData: PurchaseUpdateDTO) => {
        if (!selectedPurchase) return;

        try {
            await purchaseService.updatePurchase(selectedPurchase.id, updateData);
            setIsUpdateModalOpen(false);
            setSuccessMessage({
                title: 'Επιτυχής Ενημέρωση',
                message: `Η αγορά ενημερώθηκε επιτυχώς.`
            });
            await searchPurchases();
        } catch (error) {
            console.error('Error updating purchase:', error);
            throw error; // Let the modal handle the error
        }
    };

    const handleDeletePurchase = async () => {
        if (!selectedPurchase) return;

        try {
            await purchaseService.deletePurchase(selectedPurchase.id);
            setIsDeleteModalOpen(false);
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Η αγορά διαγράφηκε επιτυχώς.`
            });
            await searchPurchases();
        } catch (error) {
            console.error('Error deleting purchase:', error);
            await handleApiError(error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('el-GR').format(num);
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Success Alert */}
                {successMessage && (
                    <Alert
                        type="success"
                        title={successMessage.title}
                        message={successMessage.message}
                        onClose={() => setSuccessMessage(null)}
                    />
                )}

                {/* Header - Mobile responsive */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                    </div>
                    <Button
                        onClick={() => onNavigate('record-purchase')}
                        variant="create"
                        size="lg"
                        className={"w-full md:w-auto"}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Νέα Αγορά
                    </Button>
                </div>

                {/* Search and Filter Section */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard className="shadow-lg">
                        <PurchaseFilterPanel
                            // Supplier filter
                            supplierSearchTerm={supplierSearchTerm}
                            onSupplierSearchTermChange={setSupplierSearchTerm}
                            supplierSearchResults={supplierSearchResults}
                            selectedSupplier={supplierFilter}
                            onSupplierSelect={setSupplierFilter}
                            loadingSuppliers={loadingSuppliers}

                            // Material filter
                            materialSearchTerm={materialSearchTerm}
                            onMaterialSearchTermChange={setMaterialSearchTerm}
                            materialSearchResults={materialSearchResults}
                            selectedMaterial={materialFilter}
                            onMaterialSelect={setMaterialFilter}
                            loadingMaterials={loadingMaterials}

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
                            onDelete={handleDeleteRequest}
                        >
                            {/* Summary Card */}
                            {searchResults?.summary && searchResults.totalElements <= 100 && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                        Σύνοψη Αποτελεσμάτων
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {formatNumber(searchResults.summary.totalPurchasesCount)}
                                            </div>
                                            <div className="text-sm text-gray-600">Συνολικές Αγορές</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(searchResults.summary.totalAmountSpent)}
                                            </div>
                                            <div className="text-sm text-gray-600">Συνολικό Ποσό</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No Summary Warning */}
                            {searchResults && searchResults.totalElements > 100 && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <strong>Πάρα πολλά αποτελέσματα για σύνοψη:</strong> Βρέθηκαν {formatNumber(searchResults.totalElements)} αγορές.
                                                Η σύνοψη εμφανίζεται μόνο για ≤100 αποτελέσματα για λόγους απόδοσης.
                                            </p>
                                            <p className="text-sm text-yellow-600">
                                                💡 <strong>Συμβουλή:</strong> Περιορίστε τα φίλτρα σας (π.χ. ημερομηνίες, προμηθευτές, υλικά) για να δείτε τη σύνοψη.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </PurchaseFilterPanel>
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
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                                />
                            </div>
                        </CustomCard>
                    )}
                </div>

                {/* Modals */}
                {selectedPurchase && (
                    <>
                        <PurchaseDetailModal
                            isOpen={isDetailModalOpen}
                            onClose={() => {
                                console.log('Closing purchase detail modal');
                                setIsDetailModalOpen(false);
                                setPurchaseDetails(null);
                                setSelectedPurchase(null);
                            }}
                            purchaseDetails={purchaseDetails}
                            loading={detailsLoading}
                        />

                        <PurchaseUpdateModal
                            isOpen={isUpdateModalOpen}
                            onClose={() => {
                                setIsUpdateModalOpen(false);
                                setSelectedPurchase(null);
                            }}
                            purchase={selectedPurchase}
                            onUpdate={handleUpdatePurchase}
                        />
                    </>
                )}

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeletePurchase}
                    title="Επιβεβαίωση Διαγραφής"
                    message={`Είστε σίγουροι ότι θέλετε να διαγράψετε την αγορά #${selectedPurchase?.id}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`}
                />

                {successMessage && (
                    <SuccessModal
                        isOpen={true}
                        onClose={() => setSuccessMessage(null)}
                        title={successMessage.title}
                        message={successMessage.message}
                    />
                )}
            </div>
        </div>
    );
};

export default PurchaseManagementPage;