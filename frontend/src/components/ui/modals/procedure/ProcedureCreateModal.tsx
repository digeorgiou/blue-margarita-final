import React, { useState } from 'react';
import { Cog } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { ProcedureInsertDTO } from '../../../../types/api/procedureInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface ProcedureCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProcedureInsertDTO) => Promise<void>;
    currentUserId: number;
}

const ProcedureCreateModal: React.FC<ProcedureCreateModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onSubmit,
                                                                       currentUserId
                                                                   }) => {
    const [formData, setFormData] = useState<ProcedureInsertDTO>({
        name: '',
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
            'PROCEDURE_NAME_EXISTS': 'name'
        }
    });

    // Minimal client-side validation - let backend handle all the real validation
    const validateForm = (): boolean => {
        // Only check if required fields are present (basic UX check)
        if (!formData.name.trim()) {
            return false;
        }
        return true;
    };

    const handleClose = () => {
        setFormData({
            name: '',
            creatorUserId: currentUserId
        });
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof ProcedureInsertDTO, value: string | number) => {
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
            title="Δημιουργία Νέας Διαδικασίας"
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
                        <Cog className="w-4 h-4" />
                        Όνομα Διαδικασίας *
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. Γυάλισμα, Επιχρύσωση"
                        error={fieldErrors.name}
                        required
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Δώστε ένα περιγραφικό όνομα για τη διαδικασία παραγωγής
                    </p>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Cog className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Σχετικά με τις διαδικασίες:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Οι διαδικασίες αντιπροσωπεύουν τα βήματα παραγωγής των προϊόντων / πάγια έξοδα</li>
                                <li>• Κάθε προϊόν μπορεί να χρησιμοποιεί πολλές διαδικασίες</li>
                                <li>• Βοηθούν στην οργάνωση και καταγραφή της παραγωγικής διαδικασίας</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </BaseFormModal>
    );
};

export default ProcedureCreateModal;