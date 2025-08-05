import React, { useState } from 'react';
import { Input } from '../../../components/ui';
import BaseFormModal from './BaseFormModal';

interface CategoryCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>;
}

const CategoryCreateModal: React.FC<CategoryCreateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit
                                                                 }) => {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Το όνομα κατηγορίας είναι υποχρεωτικό';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Το όνομα κατηγορίας πρέπει να έχει τουλάχιστον 2 χαρακτήρες';
        } else if (name.trim().length > 100) {
            newErrors.name = 'Το όνομα κατηγορίας δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες';
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
            title="Δημιουργία Νέας Κατηγορίας"
            onSubmit={handleSubmit}
            submitText="Δημιουργία"
            cancelText="Ακύρωση"
            isValid={isValid}
        >
            <div className="space-y-4">
                <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                        Όνομα Κατηγορίας *
                    </label>
                    <Input
                        id="categoryName"
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            // Clear error when user starts typing
                            if (errors.name) {
                                setErrors(prev => ({ ...prev, name: '' }));
                            }
                        }}
                        placeholder="Εισάγετε το όνομα της κατηγορίας..."
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
            </div>
        </BaseFormModal>
    );
};

export default CategoryCreateModal;