import React from 'react';
import {
    ShoppingCart, Users, MapPin, CreditCard, Package,
    X } from 'lucide-react';
import { LoadingSpinner, Button } from '../../common';
import { getPaymentMethodDisplayName } from '../../../../utils/EnumUtils.ts';
import { FaEuroSign } from "react-icons/fa6";
import { SaleDetailModalProps } from "../../../../types/components/modal-types.ts";
import { formatCurrency, formatDate, formatNumber } from "../../../../utils/formatters.ts";
import {SaleItemDetailsDTO} from "../../../../types/api/saleInterface.ts";

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             saleDetails,
                                                             loading
                                                         }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">
                                Λεπτομέρειες Πώλησης {saleDetails ? `#${saleDetails.saleId}` : ''}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {saleDetails ? formatDate(saleDetails.saleDate) : 'Προβολή στοιχείων πώλησης'}
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
                        <div className="flex items-center justify-center py-20">
                            <LoadingSpinner size="lg" />
                            <span className="ml-3 text-gray-600">Φόρτωση λεπτομερειών...</span>
                        </div>
                    ) : saleDetails ? (
                        <div className="space-y-6">
                            {/* Basic Sale Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Customer & Location */}
                                <div className="space-y-4">
                                    {/* Customer Information */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium text-blue-700">Πελάτης</span>
                                        </div>
                                        {saleDetails.customer ? (
                                            <div className="space-y-2">
                                                <p className="font-semibold text-blue-900">{saleDetails.customer.fullName}</p>
                                                <p className="text-sm text-blue-700">{saleDetails.customer.email}</p>
                                            </div>
                                        ) : (
                                            <p className="text-blue-700 italic">Περαστικός Πελάτης</p>
                                        )}
                                    </div>

                                    {/* Location Information */}
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-green-700">Τοποθεσία</span>
                                        </div>
                                        <p className="font-semibold text-green-900">{saleDetails.location.name}</p>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                            <span className="font-medium text-purple-700">Τρόπος Πληρωμής</span>
                                        </div>
                                        <p className="font-semibold text-purple-900">
                                            {getPaymentMethodDisplayName(saleDetails.paymentMethod)}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column - Financial Summary */}
                                <div className="space-y-4">
                                    {/* Pricing Summary */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FaEuroSign className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-700">Οικονομικά Στοιχεία</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Κόστος Προϊόντων:</span>
                                                <span className="font-medium">{formatCurrency(saleDetails.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Συσκευασία:</span>
                                                <span className="font-medium">{formatCurrency(saleDetails.packagingCost)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Προτεινόμενο Σύνολο:</span>
                                                <span className="font-medium">{formatCurrency(saleDetails.suggestedTotal)}</span>
                                            </div>
                                            {saleDetails.discountAmount > 0 && (
                                                <div className="flex justify-between text-orange-600">
                                                    <span>Έκπτωση ({saleDetails.discountPercentage}%):</span>
                                                    <span className="font-medium">-{formatCurrency(saleDetails.discountAmount)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 flex justify-between text-lg font-semibold text-green-600">
                                                <span>Τελικό Σύνολο:</span>
                                                <span>{formatCurrency(saleDetails.finalTotal)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sale Type & Stats */}
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package className="w-5 h-5 text-indigo-600" />
                                            <span className="font-medium text-indigo-700">Στατιστικά Πώλησης</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-indigo-600">Τύπος Πώλησης:</span>
                                                <span className="font-medium text-indigo-900">
                                                    {saleDetails.isWholesale ? 'Χονδρική' : 'Λιανική'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-indigo-600">Σύνολο Προϊόντων:</span>
                                                <span className="font-medium text-indigo-900">
                                                    {formatNumber(saleDetails.totalItemCount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-indigo-600">Μέση Τιμή Προϊόντος:</span>
                                                <span className="font-medium text-indigo-900">
                                                    {formatCurrency(saleDetails.averageItemPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="bg-white border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-gray-600" />
                                        Προϊόντα ({saleDetails.items.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {saleDetails.items.map((item : SaleItemDetailsDTO, index : number) => (
                                        <div key={index} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">
                                                        {item.productName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 space-x-4">
                                                        <span>Κωδικός: {item.productCode}</span>
                                                        <span>Κατηγορία: {item.categoryName}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-sm text-gray-500">
                                                            <div>Ποσότητα: {formatNumber(item.quantity)}</div>
                                                            <div>Τιμή: {formatCurrency(item.priceAtTime)}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-semibold text-gray-900">
                                                                {formatCurrency(item.totalPrice)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">Σύνολο</div>
                                                        </div>
                                                    </div>
                                                    {item.totalDiscount > 0 && (
                                                        <div className="text-xs text-orange-600">
                                                            Έκπτωση Προϊόντος: {formatCurrency(item.totalDiscount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Δεν βρέθηκαν στοιχεία πώλησης
                                </h3>
                                <p className="text-gray-500">
                                    Τα στοιχεία της πώλησης δεν είναι διαθέσιμα αυτή τη στιγμή.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

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

export default SaleDetailModal;