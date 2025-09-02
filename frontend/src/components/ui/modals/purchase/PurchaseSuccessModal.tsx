import React from 'react';
import { CheckCircle, X, User, Package, Calendar, Phone } from 'lucide-react';
import { PurchaseDetailedViewDTO } from '../../../../types/api/purchaseInterface.ts';

interface PurchaseSuccessModalProps {
    purchase: PurchaseDetailedViewDTO;
    onClose: () => void;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({ purchase, onClose }) => {
    // Format money helper
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Format date helper
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('el-GR');
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
                                <h2 className="text-2xl font-bold text-gray-900">Επιτυχής Αγορά!</h2>
                                <p className="text-gray-600">Η αγορά καταχωρήθηκε επιτυχώς</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Purchase Details */}
                    <div className="space-y-6">
                        {/* Purchase ID and Date */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                        <Package className="w-4 h-4 mr-2" />
                                        Αριθμός Αγοράς:
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">#{purchase.purchaseId}</div>
                                </div>
                                <div>
                                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Ημερομηνία:
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">{formatDate(purchase.purchaseDate)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Information */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center text-sm font-medium text-blue-700 mb-3">
                                <User className="w-4 h-4 mr-2" />
                                Προμηθευτής
                            </div>
                            <div className="space-y-2">
                                <div className="text-blue-900 font-semibold text-lg">
                                    {purchase.supplierName}
                                </div>
                                {purchase.supplierContact && (
                                    <div className="flex items-center text-sm text-blue-700">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {purchase.supplierContact}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Οικονομική Σύνοψη</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Συνολικά Αντικείμενα:</span>
                                    <span className="font-medium">{purchase.totalItemCount}</span>
                                </div>

                                <div className="border-t border-green-200 pt-3">
                                    <div className="flex justify-between items-center text-lg font-bold text-green-900">
                                        <span>Συνολικό Κόστος:</span>
                                        <span>{formatMoney(purchase.totalCost)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Materials Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Υλικά Αγοράς</h3>
                            <div className="space-y-3">
                                {purchase.materials.map((material) => (
                                    <div key={material.materialId} className="bg-white p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 mb-1">
                                                    {material.materialName}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    Ποσότητα: {material.quantity.toFixed(2)} {material.unitOfMeasure}
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Τιμή αγοράς:</span>
                                                        <span className="font-medium">{formatMoney(material.priceAtTheTime)}/{material.unitOfMeasure}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Αποθηκευμένη τιμή:</span>
                                                        <span className="font-medium">{formatMoney(material.currentUnitCost)}/{material.unitOfMeasure}</span>
                                                    </div>
                                                    {material.costDifference !== 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Διαφορά:</span>
                                                            <span className={`font-medium ${material.costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                {material.costDifference > 0 ? '+' : ''}{formatMoney(material.costDifference)}/{material.unitOfMeasure}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {formatMoney(material.lineTotal)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Σύνολο υλικού
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Νέα Αγορά
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseSuccessModal;