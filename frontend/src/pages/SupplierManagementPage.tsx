import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';
import { supplierService } from '../services/supplierService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { UserPlus, Building2 } from 'lucide-react';
import type {
    SupplierReadOnlyDTO,
    SupplierDetailedViewDTO,
    SupplierInsertDTO,
    SupplierUpdateDTO
} from '../types/api/supplierInterface';
import type { Paginated } from '../types/api/dashboardInterface';

// We'll need to create these components following the customer pattern
import SupplierSearchBar from '../components/ui/searchBars/SupplierSearchBar';
import SupplierDetailModal from '../components/ui/modals/supplier/SupplierDetailModal';
import SupplierUpdateModal from '../components/ui/modals/supplier/SupplierUpdateModal';
import SupplierCreateModal from '../components/ui/modals/supplier/SupplierCreateModal';

const SupplierManagementPage = () => {
    // Search and pagination state - simplified (following customer pattern)
    const [searchTerm, setSearchTerm] = useState('');
    const [tinOnlyFilter, setTinOnlyFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<Paginated<SupplierReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected supplier and details
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierReadOnlyDTO | null>(null);
    const [supplierDetails, setSupplierDetails] = useState<SupplierDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({
        title: '',
        message: ''
    });

    // Get current user ID (following customer pattern)
    const getCurrentUserId = (): number => {
        // This should match how you get current user ID in CustomerManagementPage
        return 1; // Replace with actual user ID logic
    };

    // Search function
    const searchSuppliers = async (page: number = currentPage, size: number = pageSize) => {
        setLoading(true);
        clearErrors();

        try {
            const filters = {
                page,
                pageSize: size,
                sortBy: 'name',
                sortDirection: 'ASC'
            };

            const results = await supplierService.getSuppliersFilteredPaginated(filters);
            setSearchResults(results);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        searchSuppliers();
    }, []);

    // Debounced search when search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Reset to page 0 when search changes
            setCurrentPage(0);
            searchSuppliers(0, pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, tinOnlyFilter]);

    // Simple pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        searchSuppliers(page, pageSize);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page
        searchSuppliers(0, newPageSize);
    };

    // Modal handlers
    const handleViewDetails = async (supplier: SupplierReadOnlyDTO) => {
        setSelectedSupplier(supplier);
        setDetailsLoading(true);
        setIsDetailsModalOpen(true);

        try {
            const details = await supplierService.getSupplierDetailedView(supplier.supplierId);
            setSupplierDetails(details);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEdit = (supplier: SupplierReadOnlyDTO) => {
        setSelectedSupplier(supplier);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (supplier: SupplierReadOnlyDTO) => {
        setSelectedSupplier(supplier);
        setIsDeleteModalOpen(true);
    };

    // CRUD operations
    const handleCreateSupplier = async (data: SupplierInsertDTO) => {
        // DON'T catch errors here - let them bubble up to the modal!
        // The modal's useFormErrorHandler will handle them and show backend messages
        await supplierService.createSupplier(data);
        await searchSuppliers(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Ο προμηθευτής "${data.name}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleUpdateSupplier = async (data: SupplierUpdateDTO) => {
        // DON'T catch errors here - let them bubble up to the modal!
        await supplierService.updateSupplier(data.supplierId, data);
        await searchSuppliers(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Ενημέρωση',
            message: `Ο προμηθευτής "${data.name}" ενημερώθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleDeleteSupplier = async () => {
        if (!selectedSupplier) return;

        try {
            await supplierService.deleteSupplier(selectedSupplier.supplierId);
            await searchSuppliers(); // Refresh results
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Ο προμηθευτής "${selectedSupplier.name}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
        setIsDeleteModalOpen(false);
        setSelectedSupplier(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Διαχείριση Προμηθευτών</h1>
                            <p className="text-purple-200 mt-1">
                                Διαχειριστείτε την βάση δεδομένων των προμηθευτών σας
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                        size="lg"
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        <UserPlus className="w-5 h-5" />
                        Νέος Προμηθευτής
                    </Button>
                </div>

                {/* General Error Display */}
                {generalError && (
                    <Alert variant="error" className="mb-6">
                        {generalError}
                    </Alert>
                )}

                {/* Search and Results Card */}
                <DashboardCard
                    title="Αναζήτηση Προμηθευτών"
                    className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
                >
                    <div className="mb-4">
                        <p className="text-gray-600">
                            {searchResults ?
                                `Εμφάνιση ${searchResults.numberOfElements} από ${searchResults.totalElements} προμηθευτές` :
                                'Φόρτωση...'
                            }
                        </p>
                    </div>
                    <SupplierSearchBar
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        tinOnlyFilter={tinOnlyFilter}
                        onTinOnlyFilterChange={setTinOnlyFilter}
                        searchResults={searchResults?.data ? searchResults.data : []}
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

            {/* Modals */}
            <SupplierCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSupplier}
                currentUserId={getCurrentUserId()}
            />

            <SupplierUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateSupplier}
                supplier={selectedSupplier}
            />

            <SupplierDetailModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                supplier={supplierDetails}
                loading={detailsLoading}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteSupplier}
                title="Διαγραφή Προμηθευτή"
                message={selectedSupplier ?
                    `Είστε σίγουροι ότι θέλετε να διαγράψετε τον προμηθευτή "${selectedSupplier.name}";`
                    : ''
                }
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Ο προμηθευτής θα διαγραφεί οριστικά ή θα απενεργοποιηθεί εάν έχει ιστορικό αγορών."
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

export default SupplierManagementPage;