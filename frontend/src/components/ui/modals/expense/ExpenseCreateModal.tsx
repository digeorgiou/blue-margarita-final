import React, { useState } from 'react';
import { DollarSign, FileText, Calendar, Tag, Package, AlertTriangle } from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import type { ExpenseInsertDTO, ExpenseTypeDTO } from '../../../../types/api/expenseInterface';

interface ExpenseCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expenseData: ExpenseInsertDTO) => Promise<void>;
    expenseTypes: ExpenseTypeDTO[];
}

const ExpenseCreateModal: React.FC<ExpenseCreateModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSubmit,
                                                                   expenseTypes
                                                               }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [expenseType, setExpenseType] = useState('');
    const [purchaseId, setPurchaseId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Error handling
    const { fieldErrors, generalError, handleApiError, clearErrors, clearFieldError } = useFormErrorHandler();

    // Filter out PURCHASE_MATERIALS type from available options
    const availableExpenseTypes = expenseTypes.filter(type =>
        type.value !== 'PURCHASE_MATERIALS' && type.displayName !== 'Αγορά Υλικών'
    );

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setExpenseDate('');
        setExpenseType('');
        setPurchaseId('');
        clearErrors();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleInputChange = (field: string) => {
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            clearFieldError(field);
        }

        // Clear general error when user makes changes
        if (generalError) {
            clearErrors();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        clearErrors();

        // Minimal client-side validation - let backend handle all the real validation
        if (!description.trim() || !amount || !expenseDate || !expenseType) {
            return; // Just don't submit if basic required fields are missing
        }

        try {
            setIsSubmitting(true);

            const expenseData: ExpenseInsertDTO = {
                description: description.trim(),
                amount: parseFloat(amount),
                expenseDate: expenseDate,
                expenseType: expenseType,
                purchaseId: purchaseId ? parseInt(purchaseId) : undefined,
                creatorUserId: 1 // You'd get this from auth context
            };

            await onSubmit(expenseData);
            handleClose();
        } catch (error) {
            await handleApiError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        Δημιουργία Νέου Εξόδου
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Καταχωρήστε ένα νέο έξοδο στο σύστημα
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Purchase Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800 font-medium">Σημείωση για Αγορές</span>
                        </div>
                        <p className="text-sm text-blue-700">
                            Τα έξοδα αγοράς υλικών δημιουργούνται αυτόματα όταν καταχωρείτε μια αγορά.
                            Δεν μπορείτε να δημιουργήσετε χειροκίνητα έξοδο τύπου "Αγορά Υλικών".
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Περιγραφή Εξόδου *
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    handleInputChange('description');
                                }}
                                placeholder="π.χ. Λογαριασμός ρεύματος, Καύσιμα, Συντήρηση εξοπλισμού..."
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    fieldErrors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            />
                            {fieldErrors.description && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.description}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-2" />
                                Ποσό (€) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    handleInputChange('amount');
                                }}
                                placeholder="0.00"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    fieldErrors.amount ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            />
                            {fieldErrors.amount && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.amount}</p>
                            )}
                        </div>

                        {/* Expense Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Ημερομηνία Εξόδου *
                            </label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => {
                                    setExpenseDate(e.target.value);
                                    handleInputChange('expenseDate');
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    fieldErrors.expenseDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            />
                            {fieldErrors.expenseDate && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.expenseDate}</p>
                            )}
                        </div>

                        {/* Expense Type - Filtered to exclude PURCHASE_MATERIALS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Tag className="w-4 h-4 inline mr-2" />
                                Τύπος Εξόδου *
                            </label>
                            <select
                                value={expenseType}
                                onChange={(e) => {
                                    setExpenseType(e.target.value);
                                    handleInputChange('expenseType');
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    fieldErrors.expenseType ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
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
                            <p className="text-xs text-gray-500 mt-1">
                                Το "Αγορά Υλικών" δεν είναι διαθέσιμο - δημιουργείται αυτόματα με τις αγορές
                            </p>
                        </div>

                        {/* Purchase ID (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Package className="w-4 h-4 inline mr-2" />
                                ID Αγοράς (προαιρετικό)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={purchaseId}
                                onChange={(e) => {
                                    setPurchaseId(e.target.value);
                                    handleInputChange('purchaseId');
                                }}
                                placeholder="Εισάγετε ID αγοράς για σύνδεση"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    fieldErrors.purchaseId ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            />
                            <p className="text-gray-500 text-sm mt-1">
                                Συνδέστε αυτό το έξοδο με μια συγκεκριμένη αγορά (προαιρετικό)
                            </p>
                            {fieldErrors.purchaseId && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.purchaseId}</p>
                            )}
                        </div>

                        {/* General Error */}
                        {generalError && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-red-800 text-sm">{generalError}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline-primary"
                            disabled={isSubmitting}
                        >
                            Ακύρωση
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner/>
                                    Δημιουργία...
                                </>
                            ) : (
                                <>
                                    <DollarSign className="w-4 h-4" />
                                    Δημιουργία Εξόδου
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseCreateModal;