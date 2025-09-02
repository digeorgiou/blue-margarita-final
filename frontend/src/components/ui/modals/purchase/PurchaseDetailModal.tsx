import React from 'react';
import { X, Package, Truck, Calendar, ShoppingCart } from 'lucide-react';
import { Button, LoadingSpinner } from '../../common';
import { FaEuroSign } from "react-icons/fa6";
import type { PurchaseDetailModalProps } from "../../../../types/components/modal-types.ts";
import { formatCurrency, formatDate, formatDateTime } from "../../../../utils/formatters.ts";

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     purchaseDetails,
                                                                     loading
                                                                 }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">
                            Λεπτομέρειες Αγοράς
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : purchaseDetails ? (
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Προμηθευτής</label>
                                            <p className="text-lg font-semibold">{purchaseDetails.supplierName}</p>
                                            {purchaseDetails.supplierTin && (
                                                <p className="text-sm text-gray-600">{purchaseDetails.supplierTin}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Ημερομηνία Αγοράς</label>
                                            <p className="text-lg font-semibold">{formatDate(purchaseDetails.purchaseDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <FaEuroSign className="w-5 h-5 text-green-600" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Συνολικό Κόστος</label>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(purchaseDetails.totalCost)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Package className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Συνολικά Υλικά</label>
                                            <p className="text-lg font-semibold">{purchaseDetails.totalItemCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Materials List */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Υλικά Αγοράς
                                </h3>
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Υλικό</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Μονάδα</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Ποσότητα</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Τιμή Αγοράς</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Τρέχουσα Τιμή</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Διαφορά</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Σύνολο</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {purchaseDetails.materials.map((material, index) => (
                                                <tr key={index} className="bg-white hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {material.materialName}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {material.unitOfMeasure}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                        {material.quantity.toLocaleString('el-GR')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                        {formatCurrency(material.priceAtTheTime)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                                                        {formatCurrency(material.currentUnitCost)}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                                                        material.costDifference > 0
                                                            ? 'text-red-600'
                                                            : material.costDifference < 0
                                                                ? 'text-green-600'
                                                                : 'text-gray-600'
                                                    }`}>
                                                        {material.costDifference > 0 ? '+' : ''}
                                                        {formatCurrency(material.costDifference)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                                        {formatCurrency(material.lineTotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Δημιουργήθηκε:</span> {formatDateTime(purchaseDetails.createdAt)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Από:</span> {purchaseDetails.createdBy}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center py-20">
                            <p className="text-gray-500">Δεν ήταν δυνατή η φόρτωση των στοιχείων</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <Button onClick={onClose} variant="secondary">
                        Κλείσιμο
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetailModal;