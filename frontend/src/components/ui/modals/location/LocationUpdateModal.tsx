import React, { useState, useEffect } from 'react';
import { BaseFormModal, Input } from '../../index';
import { LocationReadOnlyDTO, LocationUpdateDTO } from '../../../../types/api/locationInterface';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';

interface LocationUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LocationUpdateDTO) => Promise<void>;
    location: LocationReadOnlyDTO | null;
}

const LocationUpdateModal: React.FC<LocationUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     location
                                                                 }) => {
    const [formData, setFormData] = useState<Omit<LocationUpdateDTO, 'locationId' | 'updaterUserId'>>({
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

    // Initialize form data when location changes
    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name || ''
            });
        }
    }, [location]);

    const validateForm = (): boolean => {
        return formData.name.trim().length > 0;
    };

    const handleClose = () => {
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof Omit<LocationUpdateDTO, 'locationId' | 'updaterUserId'>, value: string) => {
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
        if (!validateForm() || !location) {
            return;
        }

        setIsSubmitting(true);
        clearErrors();

        try {
            const dataToSubmit: LocationUpdateDTO = {
                locationId: location.locationId,
                name: formData.name.trim()
            };

            await onSubmit(dataToSubmit);
            handleClose();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.name.trim().length > 0 && !isSubmitting;

    // Check if there are any changes from the original location data
    const hasChanges = location ? (
        formData.name !== (location.name || '')
    ) : false;

    if (!location) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Τοποθεσίας"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Ενημέρωση..." : "Ενημέρωση"}
            cancelText="Ακύρωση"
            isValid={isFormValid && hasChanges}
        >
            <div className="space-y-4">
                {/* General Error Message */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

                {/* Location Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Στοιχεία Τοποθεσίας</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {location.locationId}</p>
                        <p><strong>Δημιουργήθηκε:</strong> {location ? new Date(location.createdAt).toLocaleString('el-GR') : ''}</p>
                        <p><strong>Τελευταία ενημέρωση:</strong> {location ? new Date(location.updatedAt).toLocaleString('el-GR') : ''}</p>
                    </div>
                </div>

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

                {/* Change Status */}
                {!hasChanges && isFormValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία της τοποθεσίας.
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

export default LocationUpdateModal;