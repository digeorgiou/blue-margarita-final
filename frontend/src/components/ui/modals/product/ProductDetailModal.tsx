import React from 'react';
import {
    Package,
    Calendar,
    Euro,
    Clock,
    TrendingUp,
    Activity,
    X,
    Tag,
    Boxes,
    Settings,
    AlertTriangle,
    Ruler
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { ProductDetailedViewDTO } from '../../../../types/api/productInterface';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductDetailedViewDTO | null;
    loading: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   product,
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

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Δεν υπάρχει';
        return new Date(timestamp).toLocaleDateString('el-GR');
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('el-GR').format(num);
    };

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`;
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Λεπτομέρειες Προϊόντος</h2>
                            <p className="text-green-100 text-sm">Προβολή στοιχείων και στατιστικών</p>
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
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="text-gray-600 mt-4">Φόρτωση στοιχείων προϊόντος...</p>
                        </div>
                    </div>
                ) : product ? (
                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Tag className="w-4 h-4 mr-1" />
                                            Κωδικός: {product.code}
                                        </span>
                                        <span className="flex items-center">
                                            <Package className="w-4 h-4 mr-1" />
                                            Κατηγορία: {product.categoryName}
                                        </span>
                                    </div>
                                </div>
                                {product.isLowStock && (
                                    <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg flex items-center text-sm font-medium">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Χαμηλό Απόθεμα
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Συνολικό Κόστος</p>
                                        <p className="text-xl font-bold text-blue-900">{formatCurrency(product.totalCost)}</p>
                                    </div>
                                    <Euro className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Λιανική Τιμή</p>
                                        <p className="text-xl font-bold text-green-900">{formatCurrency(product.finalRetailPrice)}</p>
                                        <p className="text-xs text-green-600">Ποσοστό Κέρδους: {formatPercentage(product.profitMarginRetail)}</p>
                                    </div>
                                    <TrendingUp className="w-6 h-6 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">Απόθεμα</p>
                                        <p className="text-xl font-bold text-purple-900">{formatNumber(product.currentStock)}</p>
                                        <p className="text-xs text-purple-600">Όριο: {formatNumber(product.lowStockAlert)}</p>
                                    </div>
                                    <Boxes className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">Χρόνος Κατασκευής</p>
                                        <p className="text-xl font-bold text-orange-900">{formatNumber(product.minutesToMake)}</p>
                                        <p className="text-xs text-orange-600">λεπτά</p>
                                    </div>
                                    <Clock className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>
                        </div>

                        {/* Pricing Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Cost Breakdown */}
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <Activity className="w-5 h-5 mr-2" />
                                    Ανάλυση Κόστους
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Κόστος Υλικών:</span>
                                        <span className="font-medium">{formatCurrency(product.materialCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Κόστος Εργατικών:</span>
                                        <span className="font-medium">{formatCurrency(product.laborCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Κόστος Διαδικασιών:</span>
                                        <span className="font-medium">{formatCurrency(product.procedureCost)}</span>
                                    </div>
                                    <hr className="border-gray-300" />
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Συνολικό Κόστος:</span>
                                        <span>{formatCurrency(product.totalCost)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Comparison */}
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Σύγκριση Τιμολόγησης
                                </h4>
                                <div className="space-y-4">
                                    {/* Retail Pricing */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Προτεινόμενη Λιανική:</span>
                                            <span className="font-medium text-green-600">{formatCurrency(product.suggestedRetailPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Τελική Λιανική:</span>
                                            <span className="font-bold">{formatCurrency(product.finalRetailPrice)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Διαφορά: {formatPercentage(product.percentageDifferenceRetail)} |
                                            Ποσοστό Κέρδους: {formatPercentage(product.profitMarginRetail)}
                                        </div>
                                    </div>

                                    <hr className="border-gray-300" />

                                    {/* Wholesale Pricing */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Προτεινόμενη Χονδρική:</span>
                                            <span className="font-medium text-blue-600">{formatCurrency(product.suggestedWholesalePrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Τελική Χονδρική:</span>
                                            <span className="font-bold">{formatCurrency(product.finalWholesalePrice)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Διαφορά: {formatPercentage(product.percentageDifferenceWholesale)} |
                                            Ποσοστό Κέρδους: {formatPercentage(product.profitMarginWholesale)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Materials and Procedures */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Materials */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                                    <Ruler className="w-5 h-5 mr-2" />
                                    Υλικά ({product.materials.length})
                                </h4>
                                {product.materials.length > 0 ? (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {product.materials.map((material) => (
                                            <div key={material.materialId} className="bg-white p-3 rounded-lg border border-blue-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-gray-900">
                                                            {material.materialName}
                                                        </h5>
                                                        <p className="text-sm text-gray-600">
                                                            Ποσότητα: {formatNumber(material.quantity)} {material.unitOfMeasure} |
                                                            Τιμή μονάδας: {formatCurrency(material.unitCost)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-900">
                                                            {formatCurrency(material.totalCost)}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Συνολικό κόστος
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-blue-600 text-sm">Δεν έχουν οριστεί υλικά για αυτό το προϊόν.</p>
                                )}
                            </div>

                            {/* Procedures */}
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Διαδικασίες ({product.procedures.length})
                                </h4>
                                {product.procedures.length > 0 ? (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {product.procedures.map((procedure) => (
                                            <div key={procedure.procedureId} className="bg-white p-3 rounded-lg border border-purple-200">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-gray-900">
                                                            {procedure.procedureName}
                                                        </h5>
                                                        <p className="text-sm text-gray-600">
                                                            Διαδικασία κατασκευής
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-gray-900">
                                                            {formatCurrency(procedure.cost)}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Κόστος
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-purple-600 text-sm">Δεν έχουν οριστεί διαδικασίες για αυτό το προϊόν.</p>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Πληροφορίες Συστήματος
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Δημιουργήθηκε:</span>
                                    <span className="ml-2 font-medium">{formatDate(product.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Τελευταία ενημέρωση:</span>
                                    <span className="ml-2 font-medium">{formatDate(product.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Δεν βρέθηκαν στοιχεία προϊόντος.</p>
                        </div>
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

export default ProductDetailModal;