import React from 'react';
import { Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '../../common';
import { GiDiamondRing } from "react-icons/gi";
import type { ProductCardProps } from "../../../types/components/resultCard-types.ts";
import { formatCurrency } from "../../../utils/formatters.ts";

const ProductCard: React.FC<ProductCardProps> = ({
                                                     product,
                                                     onViewDetails,
                                                     onEdit,
                                                     onDelete,
                                                     onAnalytics
                                                 }) => {

    const getStockStatusColor = () => {
        if (product.isLowStock) return 'text-red-600 bg-red-100';
        if (product.currentStock === 0) return 'text-gray-600 bg-gray-100';
        return 'text-green-600 bg-green-100';
    };

    const getStockStatusText = () => {
        if (product.currentStock === 0) return 'Εξαντλημένο';
        if (product.isLowStock) return 'Χαμηλό Απόθεμα';
        return 'Κανονικό';
    };

    const getPriceDifferenceColor = () => {
        const diff = product.percentageDifference;
        if (diff > 20) return 'text-red-600 bg-red-100';
        if (diff > 10) return 'text-yellow-600 bg-yellow-100';
        if (diff < -10) return 'text-blue-600 bg-blue-100';
        return 'text-green-600 bg-green-100';
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {product.name}
                        </h3>
                        <p className="text-purple-100 text-sm font-mono">
                            {product.code}
                        </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <GiDiamondRing className="w-6 h-6 text-white/80" />
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Category */}
                <div>
                    <p className="text-sm text-gray-600">{product.categoryName}</p>
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Κατάσταση Αποθέματος:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStockStatusColor()}`}>
                        {getStockStatusText()}
                    </span>
                </div>

                {/* Pricing Information */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Προτεινόμενη Τιμή:</span>
                        <span className="text-sm text-gray-700">
                            {formatCurrency(product.suggestedRetailPrice)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Τελική Τιμή:</span>
                        <span className="text-sm font-bold text-green-600">
                            {formatCurrency(product.finalRetailPrice)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Διαφορά Τιμής:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriceDifferenceColor()}`}>
                            {product.percentageDifference > 0 ? '+' : ''}{product.percentageDifference.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(product)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(product)}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="purple"
                            size="sm"
                            onClick={() => onAnalytics(product)}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>Στατιστικά</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(product)}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Διαγραφή</span>
                        </Button>
                    </div>
                </div>

                {/* Status Indicator */}
                {!product.isActive && (
                    <div className="pt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Ανενεργό Προϊόν
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;