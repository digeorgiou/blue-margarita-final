import React, { useState } from 'react';
import { BaseFormModal } from '..';
import { Input } from '../../common';
import { LocationInsertDTO } from '../../../../types/api/locationInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import type { LocationCreateModalProps } from "../../../../types/components/modal-types.ts";

const LocationCreateModal: React.FC<LocationCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit
                                                                 }) => {
    const [formData, setFormData] = useState<{ name: string }>({
        name: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use the reusable error handler hook
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    const validateForm = (): boolean => {
        // Only check if required fields are present (basic UX check)
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
            // Create the proper LocationInsertDTO with the required structure
            const locationData: LocationInsertDTO = {
                name: formData.name.trim()
            };

            await onSubmit(locationData);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
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
            title="Νέα Τοποθεσία"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Δημιουργία..." : "Δημιουργία"}
            cancelText="Ακύρωση"
            isValid={isFormValid}
        >
            <div className="space-y-4">
                {/* General Error Message */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Όνομα Τοποθεσίας"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. Website, Εργαστήριο..."
                        error={fieldErrors.name}
                        disabled={isSubmitting}
                        maxLength={55}
                    />
                </div>

                {/* Character Count */}
                <div className="text-xs text-gray-500 text-right">
                    {formData.name.length}/55 χαρακτήρες
                </div>
            </div>
        </BaseFormModal>
    );
};

export default LocationCreateModal;