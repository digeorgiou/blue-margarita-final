import React from 'react';
import { X, DollarSign, Calendar, FileText, Tag, Package, User, Clock } from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import type { ExpenseReadOnlyDTO } from '../../../../types/api/expenseInterface';

interface ExpenseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: ExpenseReadOnlyDTO | null;
    loading: boolean;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   expense,
                                                                   loading
                                                               }) => {

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string): string => {
        return new Date(dateString).toLocaleString('el-GR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Λεπτομέρειες Εξόδου</h2>
                            <p className="text-purple-100 text-sm">
                                {expense ? `Έξοδο #${expense.id}` : 'Φόρτωση...'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                            <span className="ml-2 text-gray-600">Φόρτωση λεπτομερειών...</span>
                        </div>
                    ) : !expense ? (
                        <div className="text-center py-8 text-gray-500">
                            Δεν βρέθηκαν λεπτομέρειες εξόδου
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Main Information Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Primary Details */}
                                <div className="space-y-4">
                                    {/* Description */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-700">Περιγραφή</span>
                                        </div>
                                        <p className="text-gray-900 text-lg">{expense.description}</p>
                                    </div>

                                    {/* Amount */}
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-green-700">Ποσό</span>
                                        </div>
                                        <p className="text-green-900 text-2xl font-bold">
                                            {formatCurrency(expense.amount)}
                                        </p>
                                    </div>

                                    {/* Expense Date */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium text-blue-700">Ημερομηνία Εξόδου</span>
                                        </div>
                                        <p className="text-blue-900 text-lg">{formatDate(expense.expenseDate)}</p>
                                    </div>

                                    {/* Expense Type */}
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="w-5 h-5 text-orange-600" />
                                            <span className="font-medium text-orange-700">Τύπος Εξόδου</span>
                                        </div>
                                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-orange-200 text-orange-800">
                                            {expense.expenseType}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Column - Metadata and Links */}
                                <div className="space-y-4">
                                    {/* Purchase Information */}
                                    {expense.purchaseId && expense.purchaseDescription ? (
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Package className="w-5 h-5 text-purple-600" />
                                                <span className="font-medium text-purple-700">Συνδεδεμένη Αγορά</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-purple-600">ID Αγοράς:</span>
                                                    <span className="font-medium text-purple-900">#{expense.purchaseId}</span>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-purple-600">Περιγραφή:</span>
                                                    <p className="text-purple-900 mt-1">{expense.purchaseDescription}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package className="w-5 h-5 text-gray-600" />
                                                <span className="font-medium text-gray-700">Συνδεδεμένη Αγορά</span>
                                            </div>
                                            <p className="text-gray-500 italic">Δεν είναι συνδεδεμένο με αγορά</p>
                                        </div>
                                    )}

                                    {/* Created Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-700">Δημιουργήθηκε</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-gray-600">Από:</span>
                                                <p className="text-gray-900 font-medium">{expense.createdBy}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    {formatDateTime(expense.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-700">Στοιχεία Συστήματος</span>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>ID Εξόδου:</span>
                                                <span className="font-mono text-gray-900">#{expense.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Τύπος:</span>
                                                <span className={`font-medium ${
                                                    expense.purchaseId ? 'text-blue-600' : 'text-gray-600'
                                                }`}>
                                                    {expense.purchaseId ? 'Συνδεδεμένο' : 'Χειροκίνητο'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="border-t pt-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-medium text-blue-900 mb-2">Σημειώσεις</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        {expense.purchaseId ? (
                                            <>
                                                <li>• Αυτό το έξοδο είναι συνδεδεμένο με αγορά και δημιουργήθηκε αυτόματα</li>
                                                <li>• Οποιαδήποτε αλλαγή στην αγορά θα επηρεάσει αυτό το έξοδο</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>• Αυτό το έξοδο δημιουργήθηκε χειροκίνητα</li>
                                                <li>• Μπορείτε να το επεξεργαστείτε ή να το συνδέσετε με αγορά</li>
                                            </>
                                        )}
                                        <li>• Για οποιεσδήποτε αλλαγές, χρησιμοποιήστε το κουμπί επεξεργασίας</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <Button onClick={onClose} variant="outline-primary">
                        Κλείσιμο
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseDetailModal;