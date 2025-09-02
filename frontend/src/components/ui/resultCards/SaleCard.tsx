import React from 'react';
import { Eye, Edit, Trash2, ShoppingCart, Users, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Button } from '../../common';
import type { SaleCardProps} from "../../../types/components/resultCard-types.ts";
import { formatCurrency, formatDate } from "../../../utils/formatters.ts";

const SaleCard: React.FC<SaleCardProps> = ({
                                               sale,
                                               onViewDetails,
                                               onEdit,
                                               onDelete,
                                               getPaymentMethodDisplayName
                                           }) => {

    const generateSaleTitle = () => {
        if (!sale.products || sale.products.length === 0) {
            return `Πώληση #${sale.id}`;
        }

        // If only one product, show product name and quantity
        if (sale.products.length === 1) {
            const product = sale.products[0];
            return `${product.productName} (×${product.quantity})`;
        }

        // If multiple products, show first product and count
        const firstProduct = sale.products[0];
        const remainingCount = sale.products.length - 1;

        if (remainingCount === 1) {
            return `${firstProduct.productName} (×${firstProduct.quantity}) + 1 ακόμα`;
        } else {
            return `${firstProduct.productName} (×${firstProduct.quantity}) + ${remainingCount} ακόμα`;
        }
    };

    const getSaleTypeColor = () => {
        return sale.isWholesale
            ? 'bg-purple-100 text-purple-800'
            : 'bg-green-100 text-green-800';
    };

    const getSaleTypeDisplayName = () => {
        return sale.isWholesale ? 'Χονδρικής' : 'Λιανικής';
    };

    const getDiscountColor = () => {
        if (sale.discountPercentage > 20) return 'text-red-600 bg-red-100';
        if (sale.discountPercentage > 10) return 'text-orange-600 bg-orange-100';
        if (sale.discountPercentage > 0) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {generateSaleTitle()}
                        </h3>
                    </div>
                    <div className="space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSaleTypeColor()}`}>
                                {getSaleTypeDisplayName()}
                            </span>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <ShoppingCart className="w-6 h-6 text-white/80" />
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Customer and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{sale.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{sale.locationName}</span>
                    </div>
                </div>

                {/* Date and Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{formatDate(sale.saleDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{getPaymentMethodDisplayName(sale.paymentMethod)}</span>
                    </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between font-semibold pt-1 border-t border-gray-100">
                        <span className="text-lg font-bold text-green-600">
                           Τελική Τιμή:  {formatCurrency(sale.finalTotalPrice)}
                        </span>
                    </div>
                </div>

                {/* Discount Information */}
                {sale.discountPercentage > 0 ? (
                    <div className={`flex items-center justify-between ${getDiscountColor()}`}>
                        <span className="flex items-center font-medium">
                             Έκπτωση: {sale.discountPercentage}% ({formatCurrency(sale.discountAmount)})
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center text-gray-400">
                        <span>Έκπτωση: Καμία</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(sale)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(sale)}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(sale)}
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

export default SaleCard;