import { useState, useEffect } from 'react';
import { Button, Alert, CustomCard } from '../components/ui/common';
import { ConfirmDeleteModal, ProductUsageModal, SuccessModal, MaterialCreateModal, MaterialDetailModal,MaterialUpdateModal } from '../components/ui/modals';
import { MaterialFilterPanel } from '../components/ui/filterPanels'
import { EnhancedPaginationControls } from '../components/ui/pagination';
import { CustomToggleOption } from "../components/ui/inputs";
import { materialService } from '../services/materialService';
import { authService } from '../services/authService';
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Plus } from 'lucide-react';
import type {
    MaterialReadOnlyDTO,
    MaterialDetailedViewDTO,
    MaterialInsertDTO,
    MaterialUpdateDTO
} from '../types/api/materialInterface';
import type { Paginated } from '../types/api/dashboardInterface';
import { DEFAULT_PAGE_SIZES } from "../constants/pagination.ts";

const MaterialManagementPage = () => {
    // Search and pagination state - simplified (following customer pattern)
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZES.MATERIALS);
    const [searchResults, setSearchResults] = useState<Paginated<MaterialReadOnlyDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

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

    // Admin state
    const [isAdmin, setIsAdmin] = useState(false);

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
                isActive: showInactiveOnly ? false : true,
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

    const handleToggleChange = (checked: boolean) => {
        setShowInactiveOnly(checked);
        setCurrentPage(0); // Reset to first page when toggle changes
    };


    // Load initial data
    useEffect(() => {
        searchMaterials();
    }, []);

    // Reload when toggle changes
    useEffect(() => {
        searchMaterials(0, pageSize);
    }, [showInactiveOnly]);

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

    useEffect(() => {
        const userRole = authService.getCurrentUserRole();
        setIsAdmin(userRole === 'ADMIN');
    }, []);

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

    const handleRestoreMaterial = async (material: MaterialReadOnlyDTO) => {
        try {
            await materialService.restoreMaterial(material.materialId);
            await searchMaterials(); // Reload the list
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: `Το υλικό "${material.name}" επαναφέρθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            await handleApiError(error);
        }
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
            <div className="max-w-7xl mx-auto space-y-8">
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
                        Νέο Υλικό
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* General Error Display */}
                    {generalError && (
                        <Alert variant="error" className="mb-6">
                            {generalError}
                        </Alert>
                    )}

                    {/* Search and Results Card */}
                        <CustomCard
                        className="shadow-lg"
                        >
                            <MaterialFilterPanel
                                searchTerm={searchTerm}
                                onSearchTermChange={setSearchTerm}
                                searchResults={searchResults ? searchResults.data : []}
                                loading={loading}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewProducts={handleViewProducts}
                                showInactiveOnly={showInactiveOnly}
                                onRestore={showInactiveOnly ? handleRestoreMaterial : undefined}
                            />
                    </CustomCard>

                    {/* Pagination Controls - Bottom */}
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
            </div>

            {/* Modals */}
            <MaterialCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateMaterial}
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