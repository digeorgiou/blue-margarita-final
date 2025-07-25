import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui';
import BaseFormModal from './BaseFormModal';
import type { CategoryReadOnlyDTO } from '../../../types/api/categoryInterface';

interface CategoryUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>;
    category: CategoryReadOnlyDTO;
}

const CategoryUpdateModal: React.FC<CategoryUpdateModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     category
                                                                 }) => {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Initialize form with category data when modal opens
    useEffect(() => {
        if (isOpen && category) {
            setName(category.name);
            setErrors({});
        }
    }, [isOpen, category]);

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
    };

    const handleClose = () => {
        setName('');
        setErrors({});
        onClose();
    };

    const isValid = name.trim().length >= 2 && name.trim().length <= 100;
    const hasChanges = category ? name.trim() !== category.name : true;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Κατηγορίας"
            onSubmit={handleSubmit}
            submitText="Ενημέρωση"
            cancelText="Ακύρωση"
            isValid={isValid && hasChanges}
        >
            <div className="space-y-4">
                {/* Category Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Στοιχεία Κατηγορίας</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {category?.categoryId}</p>
                        <p><strong>Δημιουργήθηκε:</strong> {category ? new Date(category.createdAt).toLocaleString('el-GR') : ''}</p>
                        <p><strong>Τελευταία ενημέρωση:</strong> {category ? new Date(category.updatedAt).toLocaleString('el-GR') : ''}</p>
                        <p><strong>Κατάσταση:</strong>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                category?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {category?.isActive ? 'Ενεργή' : 'Ανενεργή'}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
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

                {/* Change indicator */}
                {!hasChanges && isValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία της κατηγορίας.
                        </p>
                    </div>
                )}
            </div>
        </BaseFormModal>
    );
};

export default CategoryUpdateModal;