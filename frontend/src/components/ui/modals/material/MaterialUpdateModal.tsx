import React, { useState, useEffect } from 'react';
import { Euro, Ruler, AlertTriangle, Calculator } from 'lucide-react';
import { IoHammerOutline } from "react-icons/io5";
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track original price for comparison
    const [originalPrice, setOriginalPrice] = useState<number>(0);

    const {
        fieldErrors,
        generalError,
        handleApiError,
        clearErrors,
        clearFieldError
    } = useFormErrorHandler();

    // Initialize form data when material changes
    useEffect(() => {
        if (material) {
            const initialData = {
                name: material.name || '',
                currentUnitCost: material.currentUnitCost || 0,
                unitOfMeasure: material.unitOfMeasure || ''
            };

            setFormData(initialData);
            setOriginalPrice(material.currentUnitCost || 0);
        }
    }, [material]);

    const validateForm = (): boolean => {
        return formData.name.trim().length > 0 &&
            formData.unitOfMeasure.trim().length > 0 &&
            formData.currentUnitCost > 0;
    };

    const handleClose = () => {
        if(material) {
            setFormData ({
                name: material.name || '',
                currentUnitCost: material.currentUnitCost || 0,
                unitOfMeasure: material.unitOfMeasure || ''
            });
        }
        setIsSubmitting(false);
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

        setIsSubmitting(true);

        clearErrors();

        try {

            const dataToSubmit: MaterialUpdateDTO = {
                materialId: material.materialId,
                updaterUserId: 1, // TODO Replace with actual current user ID
                name: formData.name.trim(),
                currentUnitCost: formData.currentUnitCost,
                unitOfMeasure: formData.unitOfMeasure.trim()
            }

            await onSubmit(dataToSubmit);
            handleClose(); // Close modal on success
        } catch (error) {
            // The hook will handle displaying the error
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const priceHasChanged = originalPrice !== formData.currentUnitCost;

    const isFormValid = formData.name.trim().length > 0 &&
        formData.currentUnitCost > 0 &&
        formData.unitOfMeasure.trim().length > 0 &&
        !isSubmitting;

    const hasChanges = material ? (
        formData.name !== (material.name || '') ||
        formData.unitOfMeasure !== (material.unitOfMeasure || '') ||
        formData.currentUnitCost !== (material.currentUnitCost || '')
    ) : false;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Επεξεργασία Υλικού"
            submitText="Ενημέρωση"
            isValid={isFormValid && hasChanges}
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
                        <IoHammerOutline className="w-4 h-4" />
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
                            placeholder="π.χ. γραμμάρια, τεμάχια, μέτρα"
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

                {/* Price Change Warning */}
                {priceHasChanged && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <span className="text-md font-semibold text-yellow-800">
                                        Προσοχή: Αλλαγή Κόστους Υλικού
                                    </span>
                                </div>
                                <div className="space-y-2 text-xs text-yellow-700">
                                    <div className="flex justify-between items-center">
                                        <span>Παλαιό κόστος:</span>
                                        <span className="font-medium">{formatCurrency(originalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Νέο κόστος:</span>
                                        <span className="font-medium">{formatCurrency(formData.currentUnitCost)}</span>
                                    </div>
                                </div>

                                <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-200">
                                    <div className="flex items-center space-x-2">
                                        <Calculator className="w-4 h-4 text-yellow-700" />
                                        <span className="text-xs font-medium text-yellow-800">
                                            Συνιστούμε να κάνετε επανυπολογισμό των τιμών προϊόντων
                                        </span>
                                    </div>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        {`Μετά την ενημέρωση, πηγαίνετε στη διαχείριση προϊόντων και χρησιμοποιήστε το κουμπί "Επανυπολογισμός Τιμών" για να ενημερώσετε τις προτεινόμενες τιμές όλων των προϊόντων που περιέχουν ${material?.name}`}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

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