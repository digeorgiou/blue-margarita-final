import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';
import { procedureService } from '../services/procedureService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, Cog } from 'lucide-react';
import type {
    ProcedureReadOnlyDTO,
    ProcedureDetailedViewDTO,
    ProcedureInsertDTO,
    ProcedureUpdateDTO
} from '../types/api/procedureInterface';
import type { Paginated } from '../types/api/dashboardInterface';

// We'll need to create these components following the customer pattern
import ProcedureSearchBar from '../components/ui/searchBars/ProcedureSearchBar';
import ProcedureDetailModal from '../components/ui/modals/procedure/ProcedureDetailModal';
import ProcedureUpdateModal from '../components/ui/modals/procedure/ProcedureUpdateModal';
import ProcedureCreateModal from '../components/ui/modals/procedure/ProcedureCreateModal';

const ProcedureManagementPage = () => {
    // Search and pagination state - simplified (following customer pattern)
    const [searchTerm, setSearchTerm] = useState('');
    const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<Paginated<ProcedureReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected procedure and details
    const [selectedProcedure, setSelectedProcedure] = useState<ProcedureReadOnlyDTO | null>(null);
    const [procedureDetails, setProcedureDetails] = useState<ProcedureDetailedViewDTO | null>(null);
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
    const searchProcedures = async (page: number = currentPage, size: number = pageSize) => {
        setLoading(true);
        clearErrors();

        try {
            const filters = {
                page,
                pageSize: size,
                sortBy: 'name',
                sortDirection: 'ASC'
            };

            const results = await procedureService.getProceduresFilteredPaginated(filters);
            setSearchResults(results);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
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
    }, [searchTerm, activeOnlyFilter]);

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
        setIsDeleteModalOpen(false);
        setSelectedProcedure(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                            <Cog className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Διαχείριση Διαδικασιών</h1>
                            <p className="text-purple-200 mt-1">
                                Διαχειριστείτε τις διαδικασίες παραγωγής των προϊόντων σας
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                        size="lg"
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Νέα Διαδικασία
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
                    title="Αναζήτηση Διαδικασιών"
                    className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
                >
                    <div className="mb-4">
                        <p className="text-gray-600">
                            {searchResults ?
                                `Εμφάνιση ${searchResults.numberOfElements} από ${searchResults.totalElements} διαδικασίες` :
                                'Φόρτωση...'
                            }
                        </p>
                    </div>
                    <ProcedureSearchBar
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        activeOnlyFilter={activeOnlyFilter}
                        onActiveOnlyFilterChange={setActiveOnlyFilter}
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
                message={selectedProcedure ?
                    `Είστε σίγουροι ότι θέλετε να διαγράψετε τη διαδικασία "${selectedProcedure.name}";`
                    : ''
                }
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Η διαδικασία θα διαγραφεί οριστικά ή θα απενεργοποιηθεί εάν χρησιμοποιείται σε προϊόντα."
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

export default ProcedureManagementPage;