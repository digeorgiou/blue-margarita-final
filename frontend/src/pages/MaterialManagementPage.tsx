import { useState, useEffect } from 'react';
import { Button, Alert } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';
import { materialService } from '../services/materialService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, Boxes } from 'lucide-react';
import type {
    MaterialReadOnlyDTO,
    MaterialDetailedViewDTO,
    MaterialInsertDTO,
    MaterialUpdateDTO
} from '../types/api/materialInterface';
import type { Paginated } from '../types/api/dashboardInterface';

// We'll need to create these components following the customer pattern
import MaterialSearchBar from '../components/ui/searchBars/MaterialSearchBar';
import MaterialDetailModal from '../components/ui/modals/material/MaterialDetailModal';
import MaterialUpdateModal from '../components/ui/modals/material/MaterialUpdateModal';
import MaterialCreateModal from '../components/ui/modals/material/MaterialCreateModal';

const MaterialManagementPage = () => {
    // Search and pagination state - simplified (following customer pattern)
    const [searchTerm, setSearchTerm] = useState('');
    const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [searchResults, setSearchResults] = useState<Paginated<MaterialReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected material and details
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialReadOnlyDTO | null>(null);
    const [materialDetails, setMaterialDetails] = useState<MaterialDetailedViewDTO | null>(null);
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
    const searchMaterials = async (page: number = currentPage, size: number = pageSize) => {
        setLoading(true);
        clearErrors();

        try {
            const filters = {
                page,
                pageSize: size,
                sortBy: 'name',
                sortDirection: 'ASC'
            };

            const results = await materialService.getMaterialsFilteredPaginated(filters);
            setSearchResults(results);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        searchMaterials();
    }, []);

    // Debounced search when search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Reset to page 0 when search changes
            setCurrentPage(0);
            searchMaterials(0, pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, activeOnlyFilter]);

    // Simple pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        searchMaterials(page, pageSize);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page
        searchMaterials(0, newPageSize);
    };

    // Modal handlers
    const handleViewDetails = async (material: MaterialReadOnlyDTO) => {
        setSelectedMaterial(material);
        setDetailsLoading(true);
        setIsDetailsModalOpen(true);

        try {
            const details = await materialService.getMaterialDetailedView(material.materialId);
            setMaterialDetails(details);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleEdit = (material: MaterialReadOnlyDTO) => {
        setSelectedMaterial(material);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (material: MaterialReadOnlyDTO) => {
        setSelectedMaterial(material);
        setIsDeleteModalOpen(true);
    };

    // CRUD operations
    const handleCreateMaterial = async (data: MaterialInsertDTO) => {
        // DON'T catch errors here - let them bubble up to the modal!
        // The modal's useFormErrorHandler will handle them and show backend messages
        await materialService.createMaterial(data);
        await searchMaterials(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Το υλικό "${data.name}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleUpdateMaterial = async (data: MaterialUpdateDTO) => {
        // DON'T catch errors here - let them bubble up to the modal!
        await materialService.updateMaterial(data.materialId, data);
        await searchMaterials(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Ενημέρωση',
            message: `Το υλικό "${data.name}" ενημερώθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleDeleteMaterial = async () => {
        if (!selectedMaterial) return;

        try {
            await materialService.deleteMaterial(selectedMaterial.materialId);
            await searchMaterials(); // Refresh results
            setSuccessMessage({
                title: 'Επιτυχής Διαγραφή',
                message: `Το υλικό "${selectedMaterial.name}" διαγράφηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (err) {
            await handleApiError(err);
        }
        setIsDeleteModalOpen(false);
        setSelectedMaterial(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                            <Boxes className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Διαχείριση Υλικών</h1>
                            <p className="text-purple-200 mt-1">
                                Διαχειριστείτε τα υλικά που χρησιμοποιείτε στην παραγωγή
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
                        Νέο Υλικό
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
                    title="Αναζήτηση Υλικών"
                    className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
                >
                    <div className="mb-4">
                        <p className="text-gray-600">
                            {searchResults ?
                                `Εμφάνιση ${searchResults.numberOfElements} από ${searchResults.totalElements} υλικά` :
                                'Φόρτωση...'
                            }
                        </p>
                    </div>
                    <MaterialSearchBar
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
            <MaterialCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateMaterial}
                currentUserId={getCurrentUserId()}
            />

            <MaterialUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateMaterial}
                material={selectedMaterial}
            />

            <MaterialDetailModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                material={materialDetails}
                loading={detailsLoading}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteMaterial}
                title="Διαγραφή Υλικού"
                message={selectedMaterial ?
                    `Είστε σίγουροι ότι θέλετε να διαγράψετε το υλικό "${selectedMaterial.name}";`
                    : ''
                }
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Το υλικό θα διαγραφεί οριστικά ή θα απενεργοποιηθεί εάν χρησιμοποιείται σε προϊόντα."
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

export default MaterialManagementPage;