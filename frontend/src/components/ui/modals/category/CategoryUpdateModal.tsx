import React, { useState, useEffect } from 'react';
import { BaseFormModal, Input } from '../../index';
import { CategoryReadOnlyDTO } from '../../../../types/api/categoryInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface CategoryUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>; // Match what CategoryManagementPage expects
    category: CategoryReadOnlyDTO | null;
}

const CategoryUpdateModal: React.FC<CategoryUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     category
                                                                 }) => {
    const [formData, setFormData] = useState<{ name: string }>({
        name: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    // Initialize form data when category changes
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || ''
            });
        }
    }, [category]);

    const validateForm = (): boolean => {
        return formData.name.trim().length > 0;
    };

    const handleClose = () => {
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            clearFieldError(field);
        }

        // Clear general error when user makes changes
        if (generalError) {
            clearErrors();
        }
    };

    const handleSubmit = async () => {
        if (!validateForm() || !category) {
            return;
        }

        setIsSubmitting(true);
        clearErrors();

        try {

            await onSubmit({ name: formData.name.trim() });
            handleClose();
        } catch (error) {

            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name.trim().length > 0 && !isSubmitting;

    // Check if there are any changes from the original category data
    const hasChanges = category ? (
        formData.name !== (category.name || '')
    ) : false;

    if (!category) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Κατηγορίας"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Ενημέρωση..." : "Ενημέρωση"}
            cancelText="Ακύρωση"
            isValid={isFormValid && hasChanges}
        >
            <div className="space-y-4">
                {/* General Error Message - will show backend's user-friendly message */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

                {/* Category Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Στοιχεία Κατηγορίας</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {category.categoryId}</p>
                        <p><strong>Δημιουργήθηκε:</strong> {category ? new Date(category.createdAt).toLocaleString('el-GR') : ''}</p>
                        <p><strong>Τελευταία ενημέρωση:</strong> {category ? new Date(category.updatedAt).toLocaleString('el-GR') : ''}</p>
                        <p><strong>Κατάσταση:</strong>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                category?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {category?.isActive ? 'Ενεργή' : 'Ανενεργή'}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Όνομα Κατηγορίας"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. Δαχτυλίδια, Κολιέ, Σκουλαρίκια..."
                        error={fieldErrors.name}
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                </div>

                {/* Character Count */}
                <div className="text-xs text-gray-500 text-right">
                    {formData.name.length}/100 χαρακτήρες
                </div>

                {/* Change Status */}
                {!hasChanges && isFormValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία της κατηγορίας.
                        </p>
                    </div>
                )}

                {hasChanges && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            ✏️ Έχουν γίνει αλλαγές που θα αποθηκευτούν.
                        </p>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default CategoryUpdateModal;