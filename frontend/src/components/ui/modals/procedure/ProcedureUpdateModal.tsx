import React, { useState, useEffect } from 'react';
import { Cog } from 'lucide-react';
import { BaseFormModal } from '..';
import { Input } from '../../common';
import { ProcedureUpdateDTO } from '../../../../types/api/procedureInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { ProcedureUpdateModalProps } from "../../../../types/components/modal-types.ts";

const ProcedureUpdateModal: React.FC<ProcedureUpdateModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onSubmit,
                                                                       procedure
                                                                   }) => {
    const [formData, setFormData] = useState<Omit<ProcedureUpdateDTO, 'procedureId'>>({
        name: ''
    });

    // Use the reusable error handler hook
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    // Initialize form data when procedure changes
    useEffect(() => {
        if (procedure) {
            setFormData({
                name: procedure.name || '',
            });
        }
    }, [procedure]);

    const validateForm = (): boolean => {
        return formData.name.trim().length > 0;
    };

    const handleClose = () => {
        // Reset form data to original procedure values
        if (procedure) {
            setFormData({
                name: procedure.name || ''
            });
        }

        // Clear errors
        clearErrors();

        onClose();
    };

    const handleInputChange = (field: keyof Omit<ProcedureUpdateDTO, 'procedureId'>, value: string) => {
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
        if (!validateForm() || !procedure) {
            return;
        }

        clearErrors();

        try {
            const updateData: ProcedureUpdateDTO = {
                procedureId: procedure.procedureId,
                ...formData
            };

            await onSubmit(updateData);
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
            title="Επεξεργασία Διαδικασίας"
            submitText="Ενημέρωση"
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

                {/* Procedure Info Header */}
                {procedure && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900">
                            Επεξεργασία στοιχείων για: {procedure.name}
                        </h4>
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

                {/* Audit Information */}
                {procedure && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Πληροφορίες Διαδικασίας</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                            <div>
                                <span className="font-medium">Δημιουργήθηκε:</span>
                                <p>{new Date(procedure.createdAt).toLocaleDateString('el-GR')}</p>
                            </div>
                            <div>
                                <span className="font-medium">Ενημερώθηκε:</span>
                                <p>{new Date(procedure.updatedAt).toLocaleDateString('el-GR')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default ProcedureUpdateModal;