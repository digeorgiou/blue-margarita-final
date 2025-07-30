import React, { useState, useEffect } from 'react';
import { Tag, Package, Lock } from 'lucide-react';
import { BaseFormModal, Input } from '../../index';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import type { ExpenseReadOnlyDTO, ExpenseUpdateDTO, ExpenseTypeDTO } from '../../../../types/api/expenseInterface';
import { FaEuroSign } from "react-icons/fa6";

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

    // Filter out PURCHASE_MATERIALS type from available options
    const availableExpenseTypes = expenseTypes.filter(type =>
        type.value !== 'PURCHASE_MATERIALS' && type.displayName !== 'Αγορά Υλικών'
    );

    // Error handling
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Check if this is a purchase expense (has purchaseId)
    const isPurchaseExpense = expense?.purchaseId != null;

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
                // For purchase expenses, keep original amount and other fields
                amount: isPurchaseExpense ? expense.amount : formData.amount,
                expenseDate: isPurchaseExpense ? expense.expenseDate : formData.expenseDate,
                expenseType: isPurchaseExpense ? expense.expenseType : formData.expenseType,
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
    // For purchase expenses, only check description changes
    const hasChanges = expense ? (
        isPurchaseExpense ?
            formData.description !== expense.description :
            (formData.description !== expense.description ||
                formData.amount !== expense.amount ||
                formData.expenseDate !== expense.expenseDate ||
                formData.expenseType !== expense.expenseType ||
                formData.purchaseId !== expense.purchaseId)
    ) : false;

    if (!expense) return null;

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Επεξεργασία Εξόδου ${expense.description}`}
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

                {/* Purchase Expense Warning */}
                {isPurchaseExpense && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-800 font-medium">
                                Έξοδο Αγοράς - Περιορισμένη Επεξεργασία
                            </span>
                        </div>
                        <p className="text-sm text-amber-700 mb-2">
                            Αυτό το έξοδο είναι συνδεδεμένο με αγορά. Μπορείτε να αλλάξετε μόνο την περιγραφή.
                        </p>
                        <p className="text-xs text-amber-600">
                            Το ποσό, η ημερομηνία και ο τύπος συγχρονίζονται αυτόματα με την αγορά.
                        </p>
                    </div>
                )}

                {/* Current Purchase Info */}
                {expense.purchaseId && expense.purchaseDescription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600 font-medium">
                                Συνδεδεμένη αγορά:
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
                        <FaEuroSign className="w-5 h-5 mr-2 text-blue-600" />
                        Στοιχεία Εξόδου
                    </h3>

                    {/* Description - Always editable */}
                    <Input
                        label="Περιγραφή Εξόδου *"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="π.χ. Αγορά υλικών, Λογαριασμός ρεύματος..."
                        error={fieldErrors.description}
                        disabled={isSubmitting}
                    />

                    {/* Amount - Disabled for purchase expenses */}
                    <div className="relative">
                        <Input
                            label={`Ποσό (€) * ${isPurchaseExpense ? '(Συγχρονίζεται με αγορά)' : ''}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount.toString()}
                            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            error={fieldErrors.amount}
                            disabled={isSubmitting || isPurchaseExpense}
                        />
                        {isPurchaseExpense && (
                            <div className="absolute right-3 top-8">
                                <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Date - Disabled for purchase expenses */}
                    <div className="relative">
                        <Input
                            label={`Ημερομηνία Εξόδου * ${isPurchaseExpense ? '(Συγχρονίζεται με αγορά)' : ''}`}
                            type="date"
                            value={formData.expenseDate}
                            onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                            error={fieldErrors.expenseDate}
                            disabled={isSubmitting || isPurchaseExpense}
                        />
                        {isPurchaseExpense && (
                            <div className="absolute right-3 top-8">
                                <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Expense Type - Disabled for purchase expenses */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Tag className="w-4 h-4 inline mr-2" />
                            Τύπος Εξόδου * {isPurchaseExpense && '(Συγχρονίζεται με αγορά)'}
                        </label>
                        <select
                            value={formData.expenseType}
                            onChange={(e) => handleInputChange('expenseType', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                fieldErrors.expenseType ? 'border-red-500' : 'border-gray-300'
                            } ${isPurchaseExpense ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting || isPurchaseExpense}
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
                        {isPurchaseExpense && (
                            <div className="absolute right-3 top-8">
                                <Lock className="w-4 h-4 text-gray-400" />
                            </div>
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
            </div>
        </BaseFormModal>
    );
};

export default ExpenseUpdateModal;