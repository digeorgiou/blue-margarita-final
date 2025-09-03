import { useState, useEffect } from 'react';
import { Button, Alert, LoadingSpinner, CustomCard } from '../components/ui/common';
import { CategoryList }  from "../components/ui/viewAll"
import { CategoryCreateModal, CategoryUpdateModal, CategoryDetailModal, ConfirmDeleteModal, SuccessModal } from '../components/ui/modals';
import { CustomToggleOption } from "../components/ui/inputs";
import { categoryService } from '../services/categoryService';
import { authService } from "../services/authService.ts";
import { useFormErrorHandler } from '../hooks/useFormErrorHandler';
import { Gem, Plus } from 'lucide-react';
import type {
    CategoryForDropdownDTO,
    CategoryReadOnlyDTO,
    CategoryDetailedViewDTO
} from '../types/api/categoryInterface';

const CategoryManagementPage  = () => {

    const { handleApiError } = useFormErrorHandler();

    // State management
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Toggle state for showing only inactive categories
    const [showInactiveOnly, setShowInactiveOnly] = useState(false);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected item states
    const [selectedCategory, setSelectedCategory] = useState<CategoryForDropdownDTO | null>(null);
    const [selectedCategoryFull, setSelectedCategoryFull] = useState<CategoryReadOnlyDTO | null>(null);
    const [categoryDetails, setCategoryDetails] = useState<CategoryDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    const [isAdmin, setIsAdmin] = useState(false);

    // Load categories
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            if (showInactiveOnly) {
                // Load inactive categories using the filtered paginated endpoint
                const result = await categoryService.getCategoriesFilteredPaginated({
                    isActive: false,
                });
                setCategories(result);
            } else {
                // Load active categories (default behavior)
                const data = await categoryService.getCategoriesForDropdown();
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
            setError('Αποτυχία φόρτωσης κατηγοριών');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleChange = (checked: boolean) => {
        setShowInactiveOnly(checked);
    };

    // Load category details for modals
    const loadCategoryDetails = async (id: number) => {
        try {
            setDetailsLoading(true);
            const details = await categoryService.getCategoryDetailedView(id);
            setCategoryDetails(details);
        } catch (err) {
            console.error('Failed to load category details:', err);
            alert('Αποτυχία φόρτωσης λεπτομερειών κατηγορίας');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Load full category data for update modal
    const loadFullCategoryData = async (id: number) => {
        try {
            const categoryData = await categoryService.getCategoryById(id);
            setSelectedCategoryFull(categoryData);
        } catch (err) {
            console.error('Failed to load category data:', err);
            alert('Αποτυχία φόρτωσης δεδομένων κατηγορίας');
        }
    };

    // Handle create category
    const handleCreateCategory = async (data: { name: string }) => {
        await categoryService.createCategory({
            name: data.name
        });
        await loadCategories();
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Η κατηγορία "${data.name}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Handle update category
    const handleUpdateCategory = async (data: { name: string }) => {
        if (!selectedCategory) return;

        await categoryService.updateCategory({
            categoryId: selectedCategory.id,
            name: data.name
        });
        await loadCategories();
        setSuccessMessage({
            title: 'Επιτυχής Ενημέρωση',
            message: `Η κατηγορία "${data.name}" ενημερώθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Handle delete category
    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        await categoryService.deleteCategory(selectedCategory.id);
        await loadCategories();
        setSuccessMessage({
            title: 'Επιτυχής Διαγραφή',
            message: `Η κατηγορία "${selectedCategory.name}" διαγράφηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Handle restore category (for soft-deleted categories)
    const handleRestoreCategory = async (category: CategoryForDropdownDTO) => {
        try {
            await categoryService.restoreCategory(category.id);
            await loadCategories();
            setSuccessMessage({
                title: 'Επιτυχής Επαναφορά',
                message: `Η κατηγορία "${category.name}" επαναφέρθηκε επιτυχώς.`
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            handleApiError(error);
        }
    };

    // Handle view details
    const handleViewDetails = async (category: CategoryForDropdownDTO) => {
        setSelectedCategory(category);
        setIsDetailsModalOpen(true);
        await loadCategoryDetails(category.id);
    };

    // Handle edit
    const handleEdit = async (category: CategoryForDropdownDTO) => {
        setSelectedCategory(category);
        await loadFullCategoryData(category.id);
        setIsUpdateModalOpen(true);
    };

    // Handle delete
    const handleDelete = (category: CategoryForDropdownDTO) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    // Load categories when component mounts or toggle changes
    useEffect(() => {
        loadCategories();
    }, [showInactiveOnly]);

    useEffect(() => {
        const userRole = authService.getCurrentUserRole();
        setIsAdmin(userRole === 'ADMIN');
    }, []);

    if (error) {
        return (
            <div className="min-h-screen p-4">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="error">
                        <h2 className="text-xl font-bold mb-2">Κάτι πήγε στραβά</h2>
                        <p className="mb-4">{error}</p>
                        <Button onClick={loadCategories} variant="primary">
                            Προσπάθεια Ξανά
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {isAdmin && (<CustomToggleOption
                            value={showInactiveOnly}
                            onChange={handleToggleChange}
                            optionLabel="Προβολή Ανενεργών"
                            className=""
                            textClassName="text-white"
                        />)}
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Νέα Κατηγορία
                    </Button>
                </div>

                {/* Categories List */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard
                        className="bg-white/10 backdrop-blur-sm border-white/20"
                    >
                        <CategoryList
                            categories={categories}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                            onRestore={showInactiveOnly ? handleRestoreCategory : undefined}
                            showSoftDeleted={showInactiveOnly}
                        />
                    </CustomCard>
                </div>

                {/* Create Modal */}
                <CategoryCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateCategory}
                />

                {/* Update Modal */}
                {selectedCategoryFull && (
                    <CategoryUpdateModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                            setSelectedCategoryFull(null);
                        }}
                        onSubmit={handleUpdateCategory}
                        category={selectedCategoryFull}
                    />
                )}

                {/* Delete Modal */}
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteCategory}
                    title="Διαγραφή Κατηγορίας"
                    message={ selectedCategory ?
                        `Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "${selectedCategory.name}"΄;`
                        : ""}
                    warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
                />

                {/* Details Modal */}
                {isDetailsModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <Gem className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                {selectedCategory?.name || 'Κατηγορία'}
                                            </h2>
                                            <p className="text-gray-600">Λεπτομερείς αναλυτικές πληροφορίες κατηγορίας</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() => {
                                            setIsDetailsModalOpen(false);
                                            setCategoryDetails(null);
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>

                                {/* Content */}
                                {detailsLoading ? (
                                    <div className="text-center py-12">
                                        <LoadingSpinner />
                                        <p className="text-gray-500 mt-3">Φόρτωση λεπτομερειών κατηγορίας...</p>
                                    </div>
                                ) : categoryDetails ? (
                                    <CategoryDetailModal
                                        isOpen={true}
                                        onClose={() => {
                                            setIsDetailsModalOpen(false);
                                            setCategoryDetails(null);
                                        }}
                                        category={categoryDetails}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-red-500">Αποτυχία φόρτωσης λεπτομερειών</p>
                                        <Button
                                            variant="primary"
                                            onClick={() => selectedCategory && loadCategoryDetails(selectedCategory.id)}
                                            className="mt-4"
                                        >
                                            Επανάληψη
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    title={successMessage.title}
                    message={successMessage.message}
                />
            </div>
        </div>
    );
};

export default CategoryManagementPage;