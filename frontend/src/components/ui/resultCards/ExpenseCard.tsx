import React from 'react';
import { Eye, Edit, Trash2, Calendar, User, Link } from 'lucide-react';
import { FaEuroSign } from 'react-icons/fa6';
import { Button } from '../';
import type { ExpenseReadOnlyDTO } from '../../../types/api/expenseInterface';
import { getExpenseTypeDisplayName } from '../../../utils/EnumUtils';

interface ExpenseCardProps {
    expense: ExpenseReadOnlyDTO;
    onViewDetails: (expense: ExpenseReadOnlyDTO) => void;
    onEdit: (expense: ExpenseReadOnlyDTO) => void;
    onDelete: (expense: ExpenseReadOnlyDTO) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
                                                     expense,
                                                     onViewDetails,
                                                     onEdit,
                                                     onDelete
                                                 }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExpenseTypeColor = (expenseType: string) => {
        switch (expenseType.toLowerCase()) {
            case 'utilities':
                return 'text-blue-600 bg-blue-100';
            case 'rent':
                return 'text-purple-600 bg-purple-100';
            case 'marketing':
                return 'text-pink-600 bg-pink-100';
            case 'supplies':
                return 'text-green-600 bg-green-100';
            case 'equipment':
                return 'text-orange-600 bg-orange-100';
            case 'maintenance':
                return 'text-yellow-600 bg-yellow-100';
            case 'insurance':
                return 'text-indigo-600 bg-indigo-100';
            case 'legal':
                return 'text-gray-600 bg-gray-100';
            case 'travel':
                return 'text-teal-600 bg-teal-100';
            case 'other':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getAmountCategory = () => {
        const amount = expense.amount;
        if (amount < 50) return { text: 'Μικρό Έξοδο', color: 'text-green-600 bg-green-100' };
        if (amount < 200) return { text: 'Μέτριο Έξοδο', color: 'text-blue-600 bg-blue-100' };
        if (amount < 500) return { text: 'Μεγάλο Έξοδο', color: 'text-orange-600 bg-orange-100' };
        return { text: 'Πολύ Μεγάλο Έξοδο', color: 'text-red-600 bg-red-100' };
    };

    const getExpenseIcon = (expenseType: string) => {
        switch (expenseType.toLowerCase()) {
            case 'utilities':
                return '⚡';
            case 'salary':
                return '👥'
            case 'rent':
                return '🏢';
            case 'marketing':
                return '📢';
            case 'supplies':
                return '📦';
            case 'equipment':
                return '🔧';
            case 'maintenance':
                return '🛠️';
            case 'insurance':
                return '🛡️';
            case 'legal':
                return '⚖️';
            case 'travel':
                return '✈️';
            case 'other':
                return '💼';
            default:
                return '💰';
        }
    };

    const amountCategory = getAmountCategory();
    const expenseTypeColor = getExpenseTypeColor(expense.expenseType);
    const expenseIcon = getExpenseIcon(expense.expenseType);

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {expense.description}
                        </h3>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <FaEuroSign className="w-6 h-6 text-white/80" />
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Amount Information */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Ποσό:</span>
                        <span className="text-lg font-bold text-red-600">
                            {formatCurrency(expense.amount)}
                        </span>
                    </div>
                </div>

                {/* Expense Type */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Τύπος Εξόδου:</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{expenseIcon}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${expenseTypeColor}`}>
                            {getExpenseTypeDisplayName(expense.expenseType)}
                        </span>
                    </div>
                </div>

                {/* Date Information */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Ημερομηνία εξόδου:</span>
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold`}>
                            {formatDate(expense.expenseDate)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(expense)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(expense)}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(expense)}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Διαγραφή</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseCard;