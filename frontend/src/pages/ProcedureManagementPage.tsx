import { useState, useEffect } from 'react';
import { Button, Alert, ProductUsageModal } from '../components/ui';
import CustomCard from '../components/ui/common/CustomCard.tsx';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/pagination/EnhancedPaginationControls.tsx';
import { procedureService } from '../services/procedureService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus } from 'lucide-react';
import type {
    ProcedureReadOnlyDTO,
    ProcedureDetailedViewDTO,
    ProcedureInsertDTO,
    ProcedureUpdateDTO
} from '../types/api/procedureInterface';
import type { Paginated } from '../types/api/dashboardInterface';
import { ProcedureFilterPanel } from '../components/ui/filterPanels'
import ProcedureDetailModal from '../components/ui/modals/procedure/ProcedureDetailModal';
import ProcedureUpdateModal from '../components/ui/modals/procedure/ProcedureUpdateModal';
import ProcedureCreateModal from '../components/ui/modals/procedure/ProcedureCreateModal';

const ProcedureManagementPage = () => {
    // Search and pagination state - simplified (following material pattern)
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<Paginated<ProcedureReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isProductUsageModalOpen, setIsProductUsageModalOpen] = useState(false);

    // Selected items
    const [selectedProcedure, setSelectedProcedure] = useState<ProcedureReadOnlyDTO | null>(null);
    const [procedureDetails, setProcedureDetails] = useState<ProcedureDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message
    const [successMessage, setSuccessMessage] = useState<{
        title: string;
        message: string;
    } | null>(null);

    // Helper to get current user ID
    const getCurrentUserId = (): number => {
        // TODO: Get from auth context or service
        return 1; // Placeholder
    };

    // Search function
    const searchProcedures = async (page = currentPage, size = pageSize) => {
        try {
            setLoading(true);
            clearErrors();

            const response = await procedureService.getProceduresFilteredPaginated({
                name: searchTerm.trim() || undefined,
                isActive: undefined, // Show all procedures (active and inactive)
                page,
                pageSize: size,
                sortBy: 'name',
                sortDirection: 'ASC'
            });

            setSearchResults(response);
        } catch (err) {
            await handleApiError(err);
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        searchProcedures();
    }, []);

    // Debounced search when search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Reset to page 0 when search changes
            setCurrentPage(0);
            searchProcedures(0, pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Simple pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        searchProcedures(page, pageSize);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page
        searchProcedures(0, newPageSize);
    };

    // Modal handlers
    const handleViewDetails = async (procedure: ProcedureReadOnlyDTO) => {
        setSelectedProcedure(procedure);
        setDetailsLoading(true);
        setIsDetailsModalOpen(true);

        try {
            const details = await procedureService.getProcedureDetailedView(procedure.procedureId);
            setProcedureDetails(details);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewProducts = (procedure: ProcedureReadOnlyDTO) => {
        setSelectedProcedure(procedure);
        setIsProductUsageModalOpen(true);
    };

    const handleEdit = (procedure: ProcedureReadOnlyDTO) => {
        setSelectedProcedure(procedure);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (procedure: ProcedureReadOnlyDTO) => {
        setSelectedProcedure(procedure);
        setIsDeleteModalOpen(true);
    };

    // CRUD operations
    const handleCreateProcedure = async (data: ProcedureInsertDTO) => {
        // DON'T catch errors here - let them bubble up to the modal!
        // The modal's useFormErrorHandler will handle them and show backend messages
        await procedureService.createProcedure(data);
        await searchProcedures(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Η διαδικασία "${data.name}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleUpdateProcedure = async (data: ProcedureUpdateDTO) => {
        // DON'T catch errors here - let them bubble up to the modal!
        await procedureService.updateProcedure(data.procedureId, data);
        await searchProcedures(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Ενημέρωση',
            message: `Η διαδικασία "${data.name}" ενημερώθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleDeleteProcedure = async () => {
        if (!selectedProcedure) return;

        try {
            await procedureService.deleteProcedure(selectedProcedure.procedureId);
            await searchProcedures(); // Refresh results
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Η διαδικασία "${selectedProcedure.name}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-white">Φίλτρα Αναζήτησης</h3>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                        size="lg"
                        className={"w-full md:w-auto"}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Νέα Διαδικασία
                    </Button>
                </div>

                {/* General Error Display */}
                {generalError && (
                    <Alert variant="error" className="shadow-sm" onClose={clearErrors}>
                        {generalError}
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Search and Results Card */}
                    <CustomCard
                        className="shadow-lg"
                    >
                        <ProcedureFilterPanel
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            searchResults={searchResults?.data ? searchResults.data : []}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewProducts={handleViewProducts}
                        />
                    </CustomCard>

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
                </div>

                {/* Modals */}
                <ProcedureCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateProcedure}
                    currentUserId={getCurrentUserId()}
                />

                <ProcedureUpdateModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onSubmit={handleUpdateProcedure}
                    procedure={selectedProcedure}
                />

                <ProcedureDetailModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    procedure={procedureDetails}
                    loading={detailsLoading}
                />

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteProcedure}
                    title="Διαγραφή Διαδικασίας"
                    message={selectedProcedure
                        ? `Είστε σίγουρος ότι θέλετε να διαγράψετε τη διαδικασία "${selectedProcedure.name}";`
                        : ''
                    }
                />

                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    title={successMessage?.title || ''}
                    message={successMessage?.message || ''}
                />

                <ProductUsageModal
                    isOpen={isProductUsageModalOpen}
                    onClose={() => setIsProductUsageModalOpen(false)}
                    entityType="procedure"
                    entity={selectedProcedure}
                />
            </div>
        </div>
    );
};

export default ProcedureManagementPage;