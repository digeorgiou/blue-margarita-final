import React from 'react';
import {
    Cog,
    Calendar,
    Package,
    TrendingUp,
    Euro,
    Activity,
    X
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { ProcedureDetailedViewDTO } from '../../../../types/api/procedureInterface';

interface ProcedureDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    procedure: ProcedureDetailedViewDTO | null;
    loading: boolean;
}

const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       procedure,
                                                                       loading
                                                                   }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Δεν υπάρχει';
        return new Date(dateString).toLocaleDateString('el-GR');
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('el-GR').format(num);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Cog className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Στοιχεία Διαδικασίας</h2>
                            <p className="text-orange-100 text-sm">Λεπτομερής προβολή και στατιστικά χρήσης</p>
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
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <LoadingSpinner/>
                            <p className="mt-4 text-gray-600">Φόρτωση στοιχείων διαδικασίας...</p>
                        </div>
                    </div>
                ) : !procedure ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <Cog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Δεν βρέθηκαν στοιχεία διαδικασίας
                            </h3>
                            <p className="text-gray-500">
                                Τα στοιχεία της διαδικασίας δεν είναι διαθέσιμα αυτή τη στιγμή.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Cog className="w-5 h-5 mr-2 text-orange-600" />
                                Βασικά Στοιχεία
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">
                                            {procedure.name}
                                        </h4>
                                        <p className="text-gray-500">ID: {procedure.procedureId}</p>
                                        <span className={`inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full ${
                                            procedure.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {procedure.isActive ? 'Ενεργή' : 'Ανενεργή'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">Προϊόντα που την χρησιμοποιούν: {procedure.totalProductsUsing}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Euro className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">Μέσο κόστος διαδικασίας: {formatCurrency(procedure.averageProcedureCost)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">Μέση τιμή πώλησης προϊόντων (λιανική): {formatCurrency(procedure.averageProductSellingPriceRetail)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Metadata */}
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-medium text-gray-500">Δημιουργήθηκε:</span>
                                        <p className="text-gray-900">{formatDate(procedure.createdAt)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-500">Τελευταία Ενημέρωση:</span>
                                        <p className="text-gray-900">{formatDate(procedure.updatedAt)}</p>
                                    </div>
                                    {procedure.deletedAt && (
                                        <div>
                                            <span className="font-medium text-red-500">Διαγράφηκε:</span>
                                            <p className="text-red-700">{formatDate(procedure.deletedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sales Performance */}
                        <div className="bg-indigo-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                                Επιδόσεις Πωλήσεων Προϊόντων που την Χρησιμοποιούν
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatNumber(procedure.yearlySalesCount)}
                                    </div>
                                    <div className="text-sm text-gray-600">Πωλήσεις Φέτος</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Euro className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(procedure.yearlySalesRevenue)}
                                    </div>
                                    <div className="text-sm text-gray-600">Έσοδα Φέτος</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatNumber(procedure.totalSalesCount)}
                                    </div>
                                    <div className="text-sm text-gray-600">Συνολικές Πωλήσεις</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Euro className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(procedure.totalRevenue)}
                                    </div>
                                    <div className="text-sm text-gray-600">Συνολικά Έσοδα</div>
                                </div>
                            </div>

                            {/* Recent Performance */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                                    <h4 className="text-sm font-medium text-indigo-600 mb-2">Τελευταίες 30 Ημέρες</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{formatNumber(procedure.recentSalesCount)}</div>
                                            <div className="text-xs text-gray-600">Πωλήσεις</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">{formatCurrency(procedure.recentRevenue)}</div>
                                            <div className="text-xs text-gray-600">Έσοδα</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                                    <h4 className="text-sm font-medium text-indigo-600 mb-2">Τελευταία Πώληση</h4>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900">{formatDate(procedure.lastSaleDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Distribution */}
                        {procedure.categoryDistribution && procedure.categoryDistribution.length > 0 && (
                            <div className="bg-purple-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                                    Κατανομή ανά Κατηγορία
                                </h3>

                                <div className="space-y-3">
                                    {procedure.categoryDistribution.map((category) => (
                                        <div
                                            key={category.categoryId}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {category.categoryName}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {category.productCount} προϊόντα ({category.percentage}%)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Products Usage */}
                        {procedure.topProductsUsage && procedure.topProductsUsage.length > 0 && (
                            <div className="bg-green-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                    Κορυφαία Προϊόντα που Χρησιμοποιούν τη Διαδικασία
                                </h3>

                                <div className="space-y-3">
                                    {procedure.topProductsUsage.map((product) => (
                                        <div
                                            key={product.productId}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {product.productName}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Κωδικός: {product.productCode} |
                                                    Κατηγορία: {product.categoryName} |
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-900">
                                                    {formatCurrency(product.costImpact)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Επίδραση στο κόστος
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
                    <div className="flex justify-end">
                        <Button
                            onClick={onClose}
                            variant="outline-secondary"
                        >
                            Κλείσιμο
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcedureDetailModal;