import React from 'react';
import { CheckCircle, X, User, MapPin, CreditCard, Package, Calendar } from 'lucide-react';
import { SaleDetailedViewDTO } from '../../../types/api/recordSaleInterface';

interface SaleSuccessModalProps {
    sale: SaleDetailedViewDTO;
    onClose: () => void;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({ sale, onClose }) => {
    // Format money helper
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Επιτυχής Πώληση!</h2>
                                <p className="text-gray-600">Η πώληση καταχωρήθηκε επιτυχώς</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sale Details */}
                    <div className="space-y-6">
                        {/* Sale ID and Date */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                        <Package className="w-4 h-4 mr-2" />
                                        Αριθμός Πώλησης:
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">#{sale.saleId}</div>
                                </div>
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Ημερομηνία:
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">{sale.saleDate}</div>
                                </div>
                            </div>
                        </div>

                        {/* Customer and Location Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center text-sm font-medium text-blue-700 mb-2">
                                    <User className="w-4 h-4 mr-2" />
                                    Πελάτης
                                </div>
                                <div className="text-blue-900 font-medium">
                                    {sale.customer ? sale.customer.fullName : 'Μη καταχωρημένος πελάτης'}
                                </div>
                                {sale.customer?.email && (
                                    <div className="text-sm text-blue-700 mt-1">{sale.customer.email}</div>
                                )}
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center text-sm font-medium text-purple-700 mb-2">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Τοποθεσία
                                </div>
                                <div className="text-purple-900 font-medium">{sale.location.name}</div>
                            </div>
                        </div>

                        {/* Payment and Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center text-sm font-medium text-green-700 mb-2">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Τρόπος Πληρωμής
                                </div>
                                <div className="text-green-900 font-medium">{sale.paymentMethod}</div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-orange-700 mb-2">Τύπος Πώλησης</div>
                                <div className="text-orange-900 font-medium">
                                    {sale.isWholesale ? 'Χονδρική' : 'Λιανική'}
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Οικονομική Σύνοψη</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Κόστος Προϊόντων:</span>
                                    <span className="font-medium">{formatMoney(sale.subtotal)}</span>
                                </div>

                                {sale.packagingCost > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Κόστος Συσκευασίας:</span>
                                        <span className="font-medium">{formatMoney(sale.packagingCost)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Προτεινόμενο Σύνολο:</span>
                                    <span className="font-medium">{formatMoney(sale.suggestedTotal)}</span>
                                </div>

                                {sale.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-red-600">
                                        <span>Έκπτωση ({sale.discountPercentage.toFixed(1)}%):</span>
                                        <span className="font-medium">-{formatMoney(sale.discountAmount)}</span>
                                    </div>
                                )}

                                <div className="border-t border-blue-200 pt-3">
                                    <div className="flex justify-between items-center text-lg font-bold text-blue-900">
                                        <span>Τελικό Σύνολο:</span>
                                        <span>{formatMoney(sale.finalTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Προϊόντα</h3>
                            <div className="space-y-2">
                                {sale.items.map((item) => (
                                    <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{item.productName}</div>
                                            <div className="text-sm text-gray-600">
                                                Κωδικός: {item.productCode} | Κατηγορία: {item.categoryName}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="font-medium text-gray-900">
                                                {item.quantity} × {formatMoney(item.priceAtTime)} = {formatMoney(item.totalPrice)}
                                            </div>
                                            {item.totalDiscount > 0 && (
                                                <div className="text-sm text-red-600">
                                                    Έκπτωση: -{formatMoney(item.totalDiscount)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Items Statistics */}
                            <div className="mt-4 pt-4 border-t border-gray-300">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Συνολικά Προϊόντα:</span>
                                        <span className="font-medium ml-2">{sale.totalItemCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Μέση Τιμή:</span>
                                        <span className="font-medium ml-2">{formatMoney(sale.averageItemPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Νέα Πώληση
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};