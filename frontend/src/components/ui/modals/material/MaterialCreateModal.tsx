import React, { useState } from 'react';
import { Euro, Ruler } from 'lucide-react';
import { IoHammerOutline } from "react-icons/io5";
import { BaseFormModal, Input } from '../../index';
import { MaterialInsertDTO } from '../../../../types/api/materialInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface MaterialCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MaterialInsertDTO) => Promise<void>;
    currentUserId: number;
}

const MaterialCreateModal: React.FC<MaterialCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     currentUserId
                                                                 }) => {
    const [formData, setFormData] = useState<MaterialInsertDTO>({
        name: '',
        currentUnitCost: 0,
        unitOfMeasure: '',
        creatorUserId: currentUserId
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

    // Minimal client-side validation - let backend handle all the real validation
    const validateForm = (): boolean => {
        // Only check if required fields are present (basic UX check)
        if (!formData.name.trim()) {
            return false;
        }
        if (!formData.unitOfMeasure.trim()) {
            return false;
        }
        if (formData.currentUnitCost <= 0) {
            return false;
        }
        return true;
    };

    const handleClose = () => {
        setFormData({
            name: '',
            currentUnitCost: 0,
            unitOfMeasure: '',
            creatorUserId: currentUserId
        });
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof MaterialInsertDTO, value: string | number) => {
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
            const dataToSubmit: MaterialInsertDTO = {
                name: formData.name.trim(),
                currentUnitCost: formData.currentUnitCost,
                unitOfMeasure: formData.unitOfMeasure?.trim() || '',
                creatorUserId: currentUserId
            };

            await onSubmit(dataToSubmit);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name.trim().length > 0 &&
        formData.currentUnitCost > 0 &&
        formData.unitOfMeasure.trim().length > 0 &&
        !isSubmitting;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Δημιουργία Νέου Υλικού"
            submitText="Δημιουργία"
            isValid={isFormValid}
        >
            <div className="space-y-6">
                {/* General Error Display */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                            {generalError}
                        </p>
                    </div>
                )}

                {/* Name - Required */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <IoHammerOutline className="w-4 h-4" />
                        Όνομα Υλικού *
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. Χρυσό Σύρμα, Ασημένιο Κούμπωμα"
                        error={fieldErrors.name}
                        required
                        maxLength={100}
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Δώστε ένα περιγραφικό όνομα για το υλικό
                    </p>
                </div>

                {/* Unit Cost and Unit of Measure in same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit Cost - Required */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Euro className="w-4 h-4" />
                            Κόστος ανά Μονάδα *
                        </label>
                        <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.currentUnitCost}
                            onChange={(e) => handleInputChange('currentUnitCost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            error={fieldErrors.currentUnitCost}
                            required
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Κόστος σε ευρώ ανά μονάδα μέτρησης
                        </p>
                    </div>

                    {/* Unit of Measure - Required */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Ruler className="w-4 h-4" />
                            Μονάδα Μέτρησης *
                        </label>
                        <Input
                            type="text"
                            value={formData.unitOfMeasure}
                            onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
                            placeholder="π.χ. γραμμάρια, τμχ"
                            error={fieldErrors.unitOfMeasure}
                            required
                            maxLength={50}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Μονάδα μέτρησης του υλικού
                        </p>
                    </div>
                </div>

            </div>
        </BaseFormModal>
    );
};

export default MaterialCreateModal;