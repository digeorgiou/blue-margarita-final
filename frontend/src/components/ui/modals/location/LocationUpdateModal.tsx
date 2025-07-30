import React, { useState, useEffect } from 'react';
import { Input, BaseFormModal } from '../../index.ts'
import type { LocationReadOnlyDTO} from "../../../../types/api/locationInterface.ts";

interface LocationUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>;
    location: LocationReadOnlyDTO;
}

const LocationUpdateModal: React.FC<LocationUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     location
                                                                 }) => {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Initialize form with location data when modal opens
    useEffect(() => {
        if (isOpen && location) {
            setName(location.name);
            setErrors({});
        }
    }, [isOpen, location]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Το όνομα τοποθεσίας είναι υποχρεωτικό';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Το όνομα τοποθεσίας πρέπει να έχει τουλάχιστον 2 χαρακτήρες';
        } else if (name.trim().length > 100) {
            newErrors.name = 'Το όνομα τοποθεσίας δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        await onSubmit({ name: name.trim() });
    };

    const handleClose = () => {
        setName('');
        setErrors({});
        onClose();
    };

    const isValid = name.trim().length >= 2 && name.trim().length <= 100;
    const hasChanges = location ? name.trim() !== location.name : true;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Τοποθεσίας"
            onSubmit={handleSubmit}
            submitText="Ενημέρωση"
            cancelText="Ακύρωση"
            isValid={isValid && hasChanges}
        >
            <div className="space-y-4">
                {/* Location Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Στοιχεία Τοποθεσίας</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {location?.locationId}</p>
                        <p><strong>Δημιουργήθηκε:</strong> {location ? new Date(location.createdAt).toLocaleString('el-GR') : ''}</p>
                        <p><strong>Τελευταία ενημέρωση:</strong> {location ? new Date(location.updatedAt).toLocaleString('el-GR') : ''}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div>
                    <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-2">
                        Όνομα Τοποθεσίας *
                    </label>
                    <Input
                        id="locationName"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            // Clear error when user starts typing
                            if (errors.name) {
                                setErrors(prev => ({ ...prev, name: '' }));
                            }
                        }}
                        placeholder="Εισάγετε το όνομα της τοποθεσίας..."
                        maxLength={100}
                        className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        {name.length}/100 χαρακτήρες
                    </p>
                </div>

                {/* Change indicator */}
                {!hasChanges && isValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία της τοποθεσίας.
                        </p>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default LocationUpdateModal;