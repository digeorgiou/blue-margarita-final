import React, { useState } from 'react';
import { BaseFormModal, Input } from '../../index';
import { CategoryInsertDTO } from '../../../../types/api/categoryInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface CategoryCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryInsertDTO) => Promise<void>;
}

const CategoryCreateModal: React.FC<CategoryCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit
                                                                 }) => {
    const [formData, setFormData] = useState<{ name: string }>({
        name: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use the reusable error handler hook - no business error mapping needed!
    // Backend already returns user-friendly messages
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    const validateForm = (): boolean => {
        // Only basic client-side validation - let backend handle the real validation
        if (!formData.name.trim()) {
            return false;
        }
        return true;
    };

    const handleClose = () => {
        setFormData({
            name: ''
        });
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
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        clearErrors();

        try {
            const categoryData: CategoryInsertDTO = {
                name: formData.name.trim()
            };

            await onSubmit(categoryData);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error - no custom mapping needed!
            // Backend already returns user-friendly Greek messages
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name.trim().length > 0 && !isSubmitting;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Νέα Κατηγορία"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Δημιουργία..." : "Δημιουργία"}
            cancelText="Ακύρωση"
            isValid={isFormValid}
        >
            <div className="space-y-4">
                {/* General Error Message - will show backend's user-friendly message */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

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
            </div>
        </BaseFormModal>
    );
};

export default CategoryCreateModal;