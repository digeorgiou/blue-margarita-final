import { useState, useEffect } from 'react';
import { Button, Alert, CustomCard  } from '../components/ui/common';
import { ConfirmDeleteModal, ProductUsageModal, SuccessModal, ProcedureCreateModal, ProcedureDetailModal, ProcedureUpdateModal } from '../components/ui/modals';
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { ProcedureFilterPanel } from '../components/ui/filterPanels'
import { procedureService } from '../services/procedureService';
import { authService } from '../services/authService';
import { CustomToggleOption } from '../components/ui/inputs';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus } from 'lucide-react';
import type {
    ProcedureReadOnlyDTO,
    ProcedureDetailedViewDTO,
    ProcedureInsertDTO,
    ProcedureUpdateDTO
} from '../types/api/procedureInterface';
import type { Paginated } from '../types/api/dashboardInterface';
import { DEFAULT_PAGE_SIZES } from "../constants/pagination.ts";

const ProcedureManagementPage = () => {
    // Search and pagination state - simplified (following material pattern)
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.PROCEDURES);
    const [searchResults, setSearchResults] = useState<Paginated<ProcedureReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

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

    const [isAdmin, setIsAdmin] = useState(false);

    // Success message
    const [successMessage, setSuccessMessage] = useState<{
        title: string;
        message: string;
    } | null>(null);

    // Search function
    const searchProcedures = async (page = currentPage, size = pageSize) => {
        try {
            setLoading(true);
            clearErrors();

            const response = await procedureService.getProceduresFilteredPaginated({
                name: searchTerm.trim() || undefined,
                isActive: showInactiveOnly ? false : true,
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

    const handleToggleChange = (checked: boolean) => {
        setShowInactiveOnly(checked);
        setCurrentPage(0); // Reset to first page when toggle changes
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

    useEffect(() => {
        const userRole = authService.getCurrentUserRole();
        setIsAdmin(userRole === 'ADMIN');
    }, []);

    useEffect(() => {
        searchProcedures(0, pageSize);
    }, [showInactiveOnly]);

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

    const handleRestoreProcedure = async (procedure: ProcedureReadOnlyDTO) => {
        try {
            await procedureService.restoreProcedure(procedure.procedureId);
            await searchProcedures(); // Reload the list
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: `Η διαδικασία "${procedure.name}" επαναφέρθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            await handleApiError(error);
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

                    {isAdmin && (
                        <CustomToggleOption
                            value={showInactiveOnly}
                            onChange={handleToggleChange}
                            optionLabel="Προβολή Ανενεργών"
                            className=""
                            textClassName="text-white"
                        />
                    )}

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
                            showInactiveOnly={showInactiveOnly}
                            onRestore={showInactiveOnly ? handleRestoreProcedure : undefined}
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
                                setCurrentPage={setCurrentPage}
                                setPageSize={setPageSize}
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