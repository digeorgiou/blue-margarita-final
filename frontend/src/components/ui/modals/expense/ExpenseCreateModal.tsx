import React, { useState } from 'react';
import { FileText, Calendar, Tag } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import type { ExpenseInsertDTO, ExpenseTypeDTO } from '../../../../types/api/expenseInterface';
import { FaEuroSign } from "react-icons/fa6";

interface ExpenseCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expenseData: ExpenseInsertDTO) => Promise<void>;
    expenseTypes: ExpenseTypeDTO[];
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ExpenseCreateModal: React.FC<ExpenseCreateModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSubmit,
                                                                   expenseTypes
                                                               }) => {
    const [formData, setFormData] = useState<Omit<ExpenseInsertDTO, 'creatorUserId'>>({
        description: '',
        amount: 0,
        expenseDate: getTodayDateString(),
        expenseType: '',
        purchaseId: undefined
    });

    // Error handling
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Filter out PURCHASE_MATERIALS type from available options
    const availableExpenseTypes = expenseTypes.filter(type =>
        type.value !== 'PURCHASE_MATERIALS' && type.displayName !== 'Αγορά Υλικών'
    );

    // Validation function
    const validateForm = (): boolean => {
        return (
            formData.description.trim().length > 0 &&
            formData.amount > 0 &&
            formData.expenseDate.length > 0 &&
            formData.expenseType.length > 0
        );
    };

    const handleClose = () => {
        setFormData({
            description: '',
            amount: 0,
            expenseDate: getTodayDateString(),
            expenseType: '',
            purchaseId: undefined
        });
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof typeof formData, value: string | number) => {
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
            const expenseData: ExpenseInsertDTO = {
                ...formData,
                description: formData.description.trim(),
                creatorUserId: 1 // You'd get this from auth context
            };

            await onSubmit(expenseData);
            handleClose();
        } catch (error) {
            await handleApiError(error);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Δημιουργία Νέου Εξόδου"
            submitText="Δημιουργία Εξόδου"
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

                {/* Description */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Περιγραφή Εξόδου *
                    </label>
                    <Input
                        type="text"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="π.χ. Λογαριασμός ρεύματος, Συντήρηση εξοπλισμού..."
                        error={fieldErrors.description}
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FaEuroSign className="w-4 h-4" />
                        Ποσό (€) *
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount.toString()}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        error={fieldErrors.amount}
                    />
                </div>

                {/* Expense Date */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Ημερομηνία Εξόδου *
                    </label>
                    <Input
                        type="date"
                        value={formData.expenseDate}
                        onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                        error={fieldErrors.expenseDate}
                    />
                </div>

                {/* Expense Type */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4" />
                        Τύπος Εξόδου *
                    </label>
                    <select
                        value={formData.expenseType}
                        onChange={(e) => handleInputChange('expenseType', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            fieldErrors.expenseType ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Επιλέξτε τύπο εξόδου</option>
                        {Array.isArray(availableExpenseTypes) && availableExpenseTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.displayName}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.expenseType && (
                        <p className="text-red-600 text-sm mt-1">{fieldErrors.expenseType}</p>
                    )}
                </div>

            </div>
        </BaseFormModal>
    );
};

export default ExpenseCreateModal;