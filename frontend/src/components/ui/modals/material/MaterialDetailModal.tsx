import React from 'react';
import {
    Package,
    Calendar,
    User,
    Euro,
    Ruler,
    TrendingUp,
    ShoppingCart,
    Activity,
    X
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { MaterialDetailedViewDTO } from '../../../../types/api/materialInterface';

interface MaterialDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: MaterialDetailedViewDTO | null;
    loading: boolean;
}

const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     material,
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

    const formatQuantity = (quantity: number, unit: string) => {
        return `${formatNumber(quantity)} ${unit}`;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Στοιχεία Υλικού
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Λεπτομερής προβολή και στατιστικά χρήσης
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost-primary"
                            size="sm"
                            className="p-2"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="py-12 text-center">
                            <LoadingSpinner/>
                            <p className="mt-4 text-gray-600">Φόρτωση στοιχείων υλικού...</p>
                        </div>
                    ) : !material ? (
                        <div className="py-12 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Δεν βρέθηκαν στοιχεία υλικού</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Βασικά Στοιχεία
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-2xl font-bold text-gray-900">
                                                {material.name}
                                            </h5>
                                            <p className="text-gray-500">ID: {material.id}</p>
                                            <span className={`inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full ${
                                                material.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {material.isActive ? 'Ενεργό' : 'Ανενεργό'}
                                            </span>
                                        </div>

                                        {/* Cost and Unit */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Euro className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <span className="font-semibold text-lg text-gray-900">
                                                        {formatCurrency(material.costPerUnit)}
                                                    </span>
                                                    <p className="text-xs text-gray-500">ανά μονάδα</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Ruler className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <span className="font-semibold text-gray-900">
                                                        {material.unit}
                                                    </span>
                                                    <p className="text-xs text-gray-500">μονάδα μέτρησης</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Audit Info */}
                                    <div className="space-y-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Δημιουργήθηκε: {formatDate(material.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Ενημερώθηκε: {formatDate(material.updatedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>Δημιουργός: {material.createdBy}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>Τελευταία ενημέρωση από: {material.lastUpdatedBy}</span>
                                        </div>
                                        {material.deletedAt && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Διαγράφηκε: {formatDate(material.deletedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Statistics - Add yearly quantity */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Στατιστικά Αγορών
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatNumber(material.purchaseCount)}
                                        </div>
                                        <div className="text-sm text-gray-600">Συνολικές Αγορές</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                                            <Package className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatQuantity(material.recentPurchaseQuantity, material.unit)}
                                        </div>
                                        <div className="text-sm text-gray-600">Πρόσφατες Αγορές (30 ημέρες)</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                                            <Package className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatQuantity(material.yearlyPurchaseQuantity, material.unit)}
                                        </div>
                                        <div className="text-sm text-gray-600">Αγορές Φέτος</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                                            <Euro className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(material.thisYearAveragePurchasePrice)}
                                        </div>
                                        <div className="text-sm text-gray-600">Μέση Τιμή Φέτος</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                                            <Euro className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {material.lastYearAveragePurchasePrice ?
                                                formatCurrency(material.lastYearAveragePurchasePrice) :
                                                'Δ/Υ'
                                            }
                                        </div>
                                        <div className="text-sm text-gray-600">Μέση Τιμή Πέρσι</div>
                                    </div>
                                </div>

                                {/* Last Purchase Date */}
                                <div className="mt-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>Τελευταία αγορά: {formatDate(material.lastPurchaseDate)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            <div className="bg-green-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Στατιστικά Χρήσης
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                                            <Package className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatNumber(material.totalProductsUsing)}
                                        </div>
                                        <div className="text-sm text-gray-600">Προϊόντα που χρησιμοποιούν</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                            <Euro className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(material.averageCostPerProduct)}
                                        </div>
                                        <div className="text-sm text-gray-600">Μέσο κόστος ανά προϊόν</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(material.totalRevenue)}
                                        </div>
                                        <div className="text-sm text-gray-600">Συνολικά Έσοδα</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sales Performance - Add yearly revenue */}
                            <div className="bg-yellow-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Επιδόσεις Πωλήσεων
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                                            <ShoppingCart className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatNumber(material.totalSalesCount)}
                                        </div>
                                        <div className="text-sm text-gray-600">Συνολικές Πωλήσεις</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                                            <Euro className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatNumber(material.recentSalesCount)}
                                        </div>
                                        <div className="text-sm text-gray-600">Πωλήσεις (30 ημέρες)</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                            <Euro className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(material.recentRevenue)}
                                        </div>
                                        <div className="text-sm text-gray-600">Έσοδα (30 ημέρες)</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                                            <Activity className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatNumber(material.yearlySalesCount)}
                                        </div>
                                        <div className="text-sm text-gray-600">Πωλήσεις Φέτος</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-2">
                                            <Euro className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(material.yearlySalesRevenue)}
                                        </div>
                                        <div className="text-sm text-gray-600">Έσοδα Φέτος</div>
                                    </div>
                                </div>

                                {/* Last Sale Date */}
                                <div className="mt-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>Τελευταία πώληση: {formatDate(material.lastSaleDate)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Category Distribution */}
                            {material.categoryDistribution && material.categoryDistribution.length > 0 && (
                                <div className="bg-indigo-50 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Κατανομή ανά Κατηγορία
                                    </h4>

                                    <div className="space-y-3">
                                        {material.categoryDistribution.map((category) => (
                                            <div
                                                key={category.categoryId}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200"
                                            >
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">
                                                        {category.categoryName}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                        {formatNumber(category.productCount)} προϊόντα
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        {category.percentage.toFixed(1)}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        της χρήσης
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Products Using This Material */}
                            {material.topProductsUsage && material.topProductsUsage.length > 0 && (
                                <div className="bg-green-50 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Κορυφαία Προϊόντα
                                    </h4>

                                    <div className="space-y-3">
                                        {material.topProductsUsage.map((product) => (
                                            <div
                                                key={product.productId}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                                            >
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">
                                                        {product.productName}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                        Κωδικός: {product.productCode} |
                                                        Κατηγορία: {product.categoryName} |
                                                        Ποσότητα χρήσης: {formatNumber(product.usageQuantity)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        {formatCurrency(product.costImpact)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Επίδραση κόστους
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
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={onClose}
                            variant="primary"
                            className="px-6"
                        >
                            Κλείσιμο
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialDetailModal;