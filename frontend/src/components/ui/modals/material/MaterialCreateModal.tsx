import React, { useState } from 'react';
import { Package, Euro, Ruler } from 'lucide-react';
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

    // Use the reusable error handler hook
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler({
        // Map specific business errors to field errors
        businessErrorToFieldMap: {
            'MATERIAL_NAME_EXISTS': 'name'
        }
    });

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

        clearErrors();

        try {
            await onSubmit(formData);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Δημιουργία Νέου Υλικού"
            submitText="Δημιουργία"
            isValid={validateForm()}
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
                        <Package className="w-4 h-4" />
                        Όνομα Υλικού *
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. Χρυσός 18Κ, Ασήμι 925, Διαμάντι"
                        error={fieldErrors.name}
                        required
                        maxLength={100}
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
                            step="0.01"
                            min="0"
                            value={formData.currentUnitCost}
                            onChange={(e) => handleInputChange('currentUnitCost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            error={fieldErrors.currentUnitCost}
                            required
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
                            placeholder="π.χ. γραμμάρια, τεμάχια, μέτρα"
                            error={fieldErrors.unitOfMeasure}
                            required
                            maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Μονάδα μέτρησης του υλικού
                        </p>
                    </div>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Σχετικά με τα υλικά:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Τα υλικά χρησιμοποιούνται στην παραγωγή προϊόντων</li>
                                <li>• Το κόστος βοηθά στον υπολογισμό της τιμής των προϊόντων</li>
                                <li>• Μπορείτε να παρακολουθείτε τις αγορές και το στοκ</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </BaseFormModal>
    );
};

export default MaterialCreateModal;