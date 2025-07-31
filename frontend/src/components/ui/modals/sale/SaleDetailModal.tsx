import React from 'react';
import {
    ShoppingCart, Users, MapPin, CreditCard, Package,
    TrendingUp
} from 'lucide-react';
import { LoadingSpinner} from "../../index";
import { Button } from '../../index';
import type { SaleDetailedViewDTO } from '../../../types/api/recordSaleInterface';
import { FaEuroSign } from "react-icons/fa6";

interface SaleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleDetails: SaleDetailedViewDTO | null;
    loading: boolean;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             saleDetails,
                                                             loading
                                                         }) => {
    // Remove all the service call logic and state management

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ShoppingCart className="w-6 h-6 mr-3" />
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Λεπτομέρειες Πώλησης {saleDetails ? `#${saleDetails.saleId}` : ''}
                                    </h3>
                                    <p className="text-blue-100 text-sm">
                                        {saleDetails ? formatDate(saleDetails.saleDate) : ''}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="text-white hover:bg-blue-600"
                            >
                                ✕
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
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
                                                    <div className="font-semibold text-blue-900">
                                                        {saleDetails.customer.name}
                                                    </div>
                                                    {saleDetails.customer.email && (
                                                        <div className="text-sm text-blue-700">
                                                            📧 {saleDetails.customer.email}
                                                        </div>
                                                    )}
                                                    {saleDetails.customer.phoneNumber && (
                                                        <div className="text-sm text-blue-700">
                                                            📞 {saleDetails.customer.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-blue-800 font-medium">
                                                    Περαστικός Πελάτης
                                                </div>
                                            )}
                                        </div>

                                        {/* Location Information */}
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-5 h-5 text-purple-600" />
                                                <span className="font-medium text-purple-700">Τοποθεσία</span>
                                            </div>
                                            <div className="font-semibold text-purple-900">
                                                {saleDetails.location.name}
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CreditCard className="w-5 h-5 text-green-600" />
                                                <span className="font-medium text-green-700">Τρόπος Πληρωμής</span>
                                            </div>
                                            <div className="font-semibold text-green-900">
                                                {saleDetails.paymentMethod}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Financial Summary */}
                                    <div className="space-y-4">
                                        {/* Pricing Breakdown */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaEuroSign className="w-5 h-5 text-gray-600" />
                                                <span className="font-medium text-gray-700">Κατανομή Τιμών</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Υποσύνολο:</span>
                                                    <span className="font-medium">{formatCurrency(saleDetails.subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Συσκευασία:</span>
                                                    <span className="font-medium">{formatCurrency(saleDetails.packagingCost)}</span>
                                                </div>
                                                <div className="flex justify-between text-blue-600">
                                                    <span>Προτεινόμενο Σύνολο:</span>
                                                    <span className="font-semibold">{formatCurrency(saleDetails.suggestedTotal)}</span>
                                                </div>
                                                {saleDetails.discountAmount > 0 && (
                                                    <div className="flex justify-between text-orange-600">
                                                        <span>Έκπτωση ({saleDetails.discountPercentage}%):</span>
                                                        <span className="font-semibold">-{formatCurrency(saleDetails.discountAmount)}</span>
                                                    </div>
                                                )}
                                                <hr className="my-2" />
                                                <div className="flex justify-between text-lg font-bold text-green-600">
                                                    <span>Τελικό Σύνολο:</span>
                                                    <span>{formatCurrency(saleDetails.finalTotal)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sale Statistics */}
                                        <div className="bg-indigo-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                                <span className="font-medium text-indigo-700">Στατιστικά Πώλησης</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="text-center bg-white rounded p-2">
                                                    <div className="font-bold text-indigo-900">{saleDetails.totalItemCount}</div>
                                                    <div className="text-indigo-600">Συνολικά Τεμάχια</div>
                                                </div>
                                                <div className="text-center bg-white rounded p-2">
                                                    <div className="font-bold text-indigo-900">{formatCurrency(saleDetails.averageItemPrice)}</div>
                                                    <div className="text-indigo-600">Μέσος Όρος/Τεμάχιο</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sale Type */}
                                        <div className={`rounded-lg p-4 ${saleDetails.isWholesale ? 'bg-orange-50' : 'bg-pink-50'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package className={`w-5 h-5 ${saleDetails.isWholesale ? 'text-orange-600' : 'text-pink-600'}`} />
                                                <span className={`font-medium ${saleDetails.isWholesale ? 'text-orange-700' : 'text-pink-700'}`}>
                                                    Τύπος Πώλησης
                                                </span>
                                            </div>
                                            <div className={`font-semibold ${saleDetails.isWholesale ? 'text-orange-900' : 'text-pink-900'}`}>
                                                {saleDetails.isWholesale ? 'Χονδρική' : 'Λιανική'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Products Section */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Package className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-700">Προϊόντα Πώλησης</span>
                                    </div>
                                    <div className="space-y-3">
                                        {saleDetails.items.map((item, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                                {item.productCode}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">{item.categoryName}</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                                                            <div>
                                                                <span className="font-medium">Ποσότητα:</span> {item.quantity}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Τιμή/Τεμάχιο:</span> {formatCurrency(item.priceAtTime)}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Αρχική Τιμή:</span> {formatCurrency(item.originalPrice)}
                                                            </div>
                                                            {item.totalDiscount > 0 && (
                                                                <div className="text-orange-600">
                                                                    <span className="font-medium">Έκπτωση:</span> {formatCurrency(item.totalDiscount)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {formatCurrency(item.totalPrice)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Σύνολο</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Note: Metadata section removed as it's not in SaleDetailedViewDTO */}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Δεν βρέθηκαν στοιχεία πώλησης.</p>
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
        </div>
    );
};

export default SaleDetailModal;