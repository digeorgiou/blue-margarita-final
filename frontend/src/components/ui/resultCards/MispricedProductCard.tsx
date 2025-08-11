import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from "../../../utils/formatters.ts";
import type { MispricedProductAlertDTO } from '../../../types/api/dashboardInterface';
import { getPricingIssueTypeDisplayName } from "../../../utils/EnumUtils.ts";

export type MispricedProductCardProps = {
    product: MispricedProductAlertDTO;
    onNavigateToProduct: (productId: number) => void;
}

const MispricedProductCard: React.FC<MispricedProductCardProps> = ({
                                                                       product,
                                                                       onNavigateToProduct
                                                                   }) => {

    // Helper function to get issue type color
    const getIssueTypeColor = () => {
        switch (product.issueType) {
            case 'RETAIL_UNDERPRICED':
                return 'bg-red-100 text-red-800';
            case 'WHOLESALE_UNDERPRICED':
                return 'bg-pink-100 text-pink-800';
            case 'BOTH_UNDERPRICED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {product.productName}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                {product.productCode}
                            </span>
                            {product.categoryName && (
                                <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    {product.categoryName}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-white/80" />
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">

                {/* Issue Type */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 pr-2">Πρόβλημα:</span>
                    <span className={`px-2 py-1 rounded-full text-xs text-center font-semibold ${getIssueTypeColor()}`}>
                        {getPricingIssueTypeDisplayName(product.issueType)}
                    </span>
                </div>

                {/* Price Difference */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Διαφορά Τιμής:</span>
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-red-500`}>
                            {product.priceDifferencePercentage.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Retail Prices */}
                {(product.suggestedRetailPrice !== null || product.finalRetailPrice !== null) && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800">Λιανικές Τιμές:</h4>

                        {product.suggestedRetailPrice !== null && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Προτεινόμενη:</span>
                                <span className="text-sm text-gray-700">
                                    {formatCurrency(product.suggestedRetailPrice)}
                                </span>
                            </div>
                        )}

                        {product.finalRetailPrice !== null && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Τελική:</span>
                                <span className="text-sm font-bold text-green-600">
                                    {formatCurrency(product.finalRetailPrice)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Wholesale Prices */}
                {(product.suggestedWholesalePrice !== null || product.finalWholesalePrice !== null) && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800">Χονδρικές Τιμές:</h4>

                        {product.suggestedWholesalePrice !== null && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Προτεινόμενη:</span>
                                <span className="text-sm text-gray-700">
                                    {formatCurrency(product.suggestedWholesalePrice)}
                                </span>
                            </div>
                        )}

                        {product.finalWholesalePrice !== null && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Τελική:</span>
                                <span className="text-sm font-bold text-green-600">
                                    {formatCurrency(product.finalWholesalePrice)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MispricedProductCard;