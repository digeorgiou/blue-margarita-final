import { useState, useEffect } from 'react';
import { Button, Alert, CategoryDropdownList, LoadingSpinner } from '../components/ui';
import DashboardCard from '../components/ui/DashboardCard';
import CategoryCreateModal from '../components/ui/modals/CategoryCreateModal';
import CategoryUpdateModal from '../components/ui/modals/CategoryUpdateModal';
import CategoryDetailModal from '../components/ui/modals/CategoryDetailModal';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
import SuccessModal from '../components/ui/modals/SuccessModal';
import { categoryService } from '../services/categoryService';
import { Package, Plus } from 'lucide-react';
import type {
    CategoryForDropdownDTO,
    CategoryReadOnlyDTO,
    CategoryDetailedViewDTO
} from '../types/api/categoryInterface';



const CategoryManagementPage  = () => {
    // State management
    const [categories, setCategories] = useState<CategoryForDropdownDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Get current user ID (you'd get this from auth context)
    const getCurrentUserId = () => 1; // Placeholder

    // Load categories
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoryService.getCategoriesForDropdown();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
            setError('Αποτυχία φόρτωσης κατηγοριών');
        } finally {
            setLoading(false);
        }
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
            name: data.name,
            creatorUserId: getCurrentUserId()
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
            updaterUserId: getCurrentUserId(),
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

    // Load data on mount
    useEffect(() => {
        loadCategories();
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
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Διαχείριση Κατηγοριών</h1>
                        </div>
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
                <div className="mt-8">
                    <DashboardCard
                        className="bg-white/10 backdrop-blur-sm border-white/20"
                    >
                        <CategoryDropdownList
                            categories={categories}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                        />
                    </DashboardCard>
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
                                            <Package className="w-6 h-6 text-blue-600" />
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

// Export both the page and the reusable components
export default CategoryManagementPage;