import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { LocationInsertDTO } from '../../../../types/api/locationInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface LocationCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LocationInsertDTO) => Promise<void>;
}

const LocationCreateModal: React.FC<LocationCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit
                                                                 }) => {
    const [formData, setFormData] = useState<{ name: string }>({
        name: ''
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
            'LOCATION_NAME_EXISTS': 'name'
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

        clearErrors();

        try {
            // Create the proper LocationInsertDTO with the required structure
            const locationData: LocationInsertDTO = {
                name: formData.name.trim(),
                creatorUserId: 1 // TODO: Get from auth context or pass as prop
            };

            await onSubmit(locationData);
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
            title="Δημιουργία Νέας Τοποθεσίας"
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
                        <MapPin className="w-4 h-4" />
                        Όνομα Τοποθεσίας *
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="π.χ. Φυσικό Κατάστημα, Website"
                        error={fieldErrors.name}
                        required
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Δώστε ένα περιγραφικό όνομα για την τοποθεσία πώλησης
                    </p>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Σχετικά με τις τοποθεσίες:</p>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Οι τοποθεσίες αντιπροσωπεύουν τα σημεία πώλησης</li>
                                <li>• Χρησιμοποιούνται για την παρακολούθηση των πωλήσεων ανά τοποθεσία</li>
                                <li>• Κάθε πώληση συνδέεται με μια συγκεκριμένη τοποθεσία</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </BaseFormModal>
    );
};

export default LocationCreateModal;