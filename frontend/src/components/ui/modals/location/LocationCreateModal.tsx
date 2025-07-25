import React, { useState } from 'react';
import { Input, BaseFormModal } from '../../index.ts'

interface LocationCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>;
}

const LocationCreateModal: React.FC<LocationCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit
                                                                 }) => {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

        // Reset form
        setName('');
        setErrors({});
    };

    const handleClose = () => {
        setName('');
        setErrors({});
        onClose();
    };

    const isValid = name.trim().length >= 2 && name.trim().length <= 100;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Δημιουργία Νέας Τοποθεσίας"
            onSubmit={handleSubmit}
            submitText="Δημιουργία"
            cancelText="Ακύρωση"
            isValid={isValid}
        >
            <div className="space-y-4">
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Συμβουλή:</strong> Επιλέξτε ένα περιγραφικό όνομα που θα βοηθήσει στην εύκολη αναγνώριση της τοποθεσίας πώλησης.
                    </p>
                </div>
            </div>
        </BaseFormModal>
    );
};

export default LocationCreateModal;