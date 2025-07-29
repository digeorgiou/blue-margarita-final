import { useState, useEffect } from 'react';
import { Button, Alert, ProductUsageModal } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import EnhancedPaginationControls from '../components/ui/EnhancedPaginationControls';
import { materialService } from '../services/materialService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus, Boxes, Search } from 'lucide-react';
import type {
    MaterialReadOnlyDTO,
    MaterialDetailedViewDTO,
    MaterialInsertDTO,
    MaterialUpdateDTO
} from '../types/api/materialInterface';
import type { Paginated } from '../types/api/dashboardInterface';

// We'll need to create these components following the customer pattern
import MaterialSearchBar from '../components/ui/searchBars/MaterialSearchBar';
import MaterialDetailModal from "../components/ui/modals/material/MaterialDetailModal.tsx";
import MaterialUpdateModal from '../components/ui/modals/material/MaterialUpdateModal';
import MaterialCreateModal from '../components/ui/modals/material/MaterialCreateModal';

const MaterialManagementPage = () => {
    // Search and pagination state - simplified (following customer pattern)
    const [searchTerm, setSearchTerm] = useState('');
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

    const [isProductUsageModalOpen, setIsProductUsageModalOpen] = useState(false);

    // Get current user ID (following customer pattern)
    const getCurrentUserId = (): number => {
        // This should match how you get current user ID in CustomerManagementPage
        return 1; // Replace with actual user ID logic
    };

    // Search function
    const searchMaterials = async (page: number = currentPage, size: number = pageSize) => {

        try {
            setLoading(true);
            clearErrors();

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

            const data = await materialService.getMaterialsFilteredPaginated(filters);
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
    }, [searchTerm]);

    useEffect(() => {
        searchMaterials();
    }, [currentPage, pageSize]);

    // Simple pagination handlers
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0);
    };

    // Modal handlers
    const handleViewDetails = async (material: MaterialReadOnlyDTO) => {
        try {
            setSelectedMaterial(material);
            setIsDetailsModalOpen(true);
            setDetailsLoading(true);
            const details = await materialService.getMaterialDetailedView(material.materialId);
            setMaterialDetails(details);
        } catch (err) {
            await handleApiError(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewProducts = (material: MaterialReadOnlyDTO) => {
        setSelectedMaterial(material);
        setIsProductUsageModalOpen(true);
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
        await materialService.createMaterial(data);
        await searchMaterials(); // Refresh results
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Το υλικό "${data.name}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    const handleUpdateMaterial = async (data: MaterialUpdateDTO) => {
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
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Boxes className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Διαχείριση Υλικών</h1>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Νέο Υλικό
                    </Button>
                </div>

                {/* Pagination Controls - Bottom */}
                {searchResults && searchResults.totalElements > 0 && (
                    <DashboardCard className="shadow-lg">
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
                    </DashboardCard>
                )}

                {/* General Error Display */}
                {generalError && (
                    <Alert variant="error" className="mb-6">
                        {generalError}
                    </Alert>
                )}

                {/* Search and Results Card */}
                    <DashboardCard
                    title="Αναζήτηση Υλικού"
                    icon={<Search className="w-5 h-5" />}
                    className="shadow-lg"
                    >
                        <MaterialSearchBar
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            searchResults={searchResults ? searchResults.data : []}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewProducts={handleViewProducts}
                        />
                </DashboardCard>
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
                warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title={successMessage.title}
                message={successMessage.message}
            />

            <ProductUsageModal
                isOpen={isProductUsageModalOpen}
                onClose={() => setIsProductUsageModalOpen(false)}
                entity={selectedMaterial}
                entityType="material"
            />
        </div>
    );
};

export default MaterialManagementPage;