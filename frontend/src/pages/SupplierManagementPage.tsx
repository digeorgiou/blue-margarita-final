import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';
import { supplierService } from '../services/supplierService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Truck, UserPlus, Search } from 'lucide-react';
import type {
    SupplierReadOnlyDTO,
    SupplierDetailedViewDTO,
    SupplierInsertDTO,
    SupplierUpdateDTO
} from '../types/api/supplierInterface';
import type { Paginated } from '../types/api/dashboardInterface';

import { SupplierFilterPanel } from '../components/ui/filterPanels'


import SupplierDetailModal from '../components/ui/modals/supplier/SupplierDetailModal';
import SupplierUpdateModal from '../components/ui/modals/supplier/SupplierUpdateModal';
import SupplierCreateModal from '../components/ui/modals/supplier/SupplierCreateModal';

const SupplierManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
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

    // Selected supplier states
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierReadOnlyDTO | null>(null);
    const [supplierDetails, setSupplierDetails] = useState<SupplierDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    // Get current user ID (you'd get this from auth context)
    const getCurrentUserId = () => 1; // Placeholder

    // Simple search function
    const searchSuppliers = async (page: number = currentPage, size: number = pageSize) => {
        try {
            setLoading(true);
            clearErrors();

            // If search term is less than 2 characters and not empty, don't search
            if (searchTerm.length > 0 && searchTerm.length < 2) {
                setLoading(false);
                return;
            }

            const filters = {
                name: searchTerm.trim() || undefined,
                isActive: true,
                page,
                pageSize: size,
                sortBy: 'name',
                sortDirection: 'ASC'
            };

            const data = await supplierService.getSuppliersFilteredPaginated(filters);
            setSearchResults(data);
        } catch (err) {
            await handleApiError(err);
            setSearchResults(null);
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
    }, [searchTerm]);

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
        // The modal's useFormErrorHandler will handle them and show backend messages
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
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section - Matching CustomerManagementPage exactly */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Διαχείριση Προμηθευτών</h1>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Νέος Προμηθευτής
                    </Button>
                </div>

                {/* Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                {/* Pagination Controls - Top */}
                {searchResults && searchResults.totalElements > 0 && (
                    <CustomCard className="shadow-lg">
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
                    </CustomCard>
                )}

                {/* Search Section */}
                <CustomCard
                    title="Αναζήτηση Προμηθευτή"
                    icon={<Search className="w-5 h-5" />}
                    className="shadow-lg"
                >
                    <SupplierFilterPanel
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        searchResults={searchResults?.data ? searchResults.data : []}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </CustomCard>
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
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
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