import React, { useState, useEffect } from 'react';
import { Package, Euro, Ruler } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { MaterialReadOnlyDTO, MaterialUpdateDTO } from '../../../../types/api/materialInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface MaterialUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MaterialUpdateDTO) => Promise<void>;
    material: MaterialReadOnlyDTO | null;
}

const MaterialUpdateModal: React.FC<MaterialUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     material
                                                                 }) => {
    const [formData, setFormData] = useState<Omit<MaterialUpdateDTO, 'materialId' | 'updaterUserId'>>({
        name: '',
        currentUnitCost: 0,
        unitOfMeasure: ''
    });

    // Use the reusable error handler hook
    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler({
        businessErrorToFieldMap: {
            'MATERIAL_NAME_EXISTS': 'name'
        }
    });

    // Initialize form data when material changes
    useEffect(() => {
        if (material) {
            setFormData({
                name: material.name || '',
                currentUnitCost: material.currentUnitCost || 0,
                unitOfMeasure: material.unitOfMeasure || ''
            });
        }
    }, [material]);

    const validateForm = (): boolean => {
        return formData.name.trim().length > 0 &&
            formData.unitOfMeasure.trim().length > 0 &&
            formData.currentUnitCost > 0;
    };

    const handleClose = () => {
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof Omit<MaterialUpdateDTO, 'materialId' | 'updaterUserId'>, value: string | number) => {
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
        if (!validateForm() || !material) {
            return;
        }

        clearErrors();

        try {
            const updateData: MaterialUpdateDTO = {
                materialId: material.materialId,
                updaterUserId: 1, // Replace with actual current user ID
                ...formData
            };

            await onSubmit(updateData);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Επεξεργασία Υλικού"
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

                {/* Material Info Header */}
                {material && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900">
                            Επεξεργασία στοιχείων για: {material.name}
                        </h4>
                        <span className="text-xs">Τρέχον κόστος: {formatCurrency(material.currentUnitCost)}</span>
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

                {/* Audit Information */}
                {material && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Πληροφορίες Δημιουργίας Υλικού</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                            <div>
                                <span className="font-medium">Δημιουργήθηκε:</span>
                                <p>{new Date(material.createdAt).toLocaleDateString('el-GR')}</p>
                            </div>
                            <div>
                                <span className="font-medium">Ενημερώθηκε:</span>
                                <p>{new Date(material.updatedAt).toLocaleDateString('el-GR')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default MaterialUpdateModal;