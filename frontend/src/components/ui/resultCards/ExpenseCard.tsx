import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { FaEuroSign } from 'react-icons/fa6';
import { Button } from '../';
import { getExpenseTypeDisplayName } from '../../../utils/EnumUtils';
import { ExpenseCardProps } from "../../../types/components/resultCard-types.ts";
import { formatCurrency, formatDate } from "../../../utils/formatters.ts";
import { getExpenseTypeColor, getExpenseIcon } from "./expense-card-config.ts";

const ExpenseCard: React.FC<ExpenseCardProps> = ({
                                                     expense,
                                                     onViewDetails,
                                                     onEdit,
                                                     onDelete
                                                 }) => {

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