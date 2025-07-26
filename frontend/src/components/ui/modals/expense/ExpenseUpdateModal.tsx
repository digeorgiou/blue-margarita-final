import React, { useState, useEffect } from 'react';
import { DollarSign, Tag, Package } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import type { ExpenseReadOnlyDTO, ExpenseUpdateDTO, ExpenseTypeDTO } from '../../../../types/api/expenseInterface';

interface ExpenseUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expenseData: ExpenseUpdateDTO) => Promise<void>;
    expense: ExpenseReadOnlyDTO | null;
    expenseTypes: ExpenseTypeDTO[];
}

const ExpenseUpdateModal: React.FC<ExpenseUpdateModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSubmit,
                                                                   expense,
                                                                   expenseTypes
                                                               }) => {
    const [formData, setFormData] = useState<Omit<ExpenseUpdateDTO, 'expenseId' | 'updaterUserId'>>({
        description: '',
        amount: 0,
        expenseDate: '',
        expenseType: '',
        purchaseId: undefined
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Error handling
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Initialize form data when expense changes
    useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description || '',
                amount: expense.amount || 0,
                expenseDate: expense.expenseDate || '',
                expenseType: expense.expenseType || '',
                purchaseId: expense.purchaseId || undefined
            });
        }
    }, [expense]);

    const validateForm = (): boolean => {
        return formData.description.trim().length > 0 &&
            formData.amount > 0 &&
            formData.expenseDate.length > 0 &&
            formData.expenseType.length > 0;
    };

    const handleClose = () => {
        clearErrors();
        onClose();
    };

    const handleInputChange = (field: keyof Omit<ExpenseUpdateDTO, 'expenseId' | 'updaterUserId'>, value: string | number) => {
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
        if (!validateForm() || !expense) return;

        setIsSubmitting(true);
        clearErrors();

        try {
            const dataToSubmit: ExpenseUpdateDTO = {
                expenseId: expense.id,
                updaterUserId: 1, // You'd get this from auth context
                description: formData.description.trim(),
                amount: formData.amount,
                expenseDate: formData.expenseDate,
                expenseType: formData.expenseType,
                purchaseId: formData.purchaseId || undefined
            };

            await onSubmit(dataToSubmit);
            handleClose();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = validateForm() && !isSubmitting;

    // Check if there are any changes from the original expense data
    const hasChanges = expense ? (
        formData.description !== expense.description ||
        formData.amount !== expense.amount ||
        formData.expenseDate !== expense.expenseDate ||
        formData.expenseType !== expense.expenseType ||
        formData.purchaseId !== expense.purchaseId
    ) : false;

    if (!expense) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Επεξεργασία Εξόδου"
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Ενημέρωση..." : "Ενημέρωση Εξόδου"}
            cancelText="Ακύρωση"
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

                {/* Current Purchase Info */}
                {expense.purchaseId && expense.purchaseDescription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600 font-medium">
                                Τρέχον σύνδεσμος με αγορά:
                            </span>
                            <span className="text-blue-900">
                                #{expense.purchaseId} - {expense.purchaseDescription}
                            </span>
                        </div>
                    </div>
                )}

                {/* Expense Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                        Στοιχεία Εξόδου
                    </h3>

                    <Input
                        label="Περιγραφή Εξόδου *"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="π.χ. Αγορά υλικών, Λογαριασμός ρεύματος..."
                        error={fieldErrors.description}
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Ποσό (€) *"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount.toString()}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        error={fieldErrors.amount}
                        disabled={isSubmitting}
                    />

                    <Input
                        label="Ημερομηνία Εξόδου *"
                        type="date"
                        value={formData.expenseDate}
                        onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                        error={fieldErrors.expenseDate}
                        disabled={isSubmitting}
                    />

                    {/* Expense Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Tag className="w-4 h-4 inline mr-2" />
                            Τύπος Εξόδου *
                        </label>
                        <select
                            value={formData.expenseType}
                            onChange={(e) => handleInputChange('expenseType', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                fieldErrors.expenseType ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isSubmitting}
                        >
                            <option value="">Επιλέξτε τύπο εξόδου</option>
                            {Array.isArray(expenseTypes) && expenseTypes.length > 0 && expenseTypes.map((type) => (
                                <option key={type.value || type} value={type.value || type}>
                                    {type.displayName || type}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.expenseType && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.expenseType}</p>
                        )}
                    </div>
                </div>

                {/* Change Status */}
                {!hasChanges && isFormValid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Δεν έχουν γίνει αλλαγές στα στοιχεία του εξόδου.
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

export default ExpenseUpdateModal;