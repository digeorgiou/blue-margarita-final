import React from 'react';
import { X, CheckCircle, AlertCircle, Clock, User, TrendingUp } from 'lucide-react';
import { Button } from '../../index.ts';
import { PriceRecalculationUtils } from '../../../../types/api/productInterface.ts';
import { PriceRecalculationResultModalProps } from "../../../../types/components/modal-types.ts";

const PriceRecalculationResultModal: React.FC<PriceRecalculationResultModalProps> = ({
                                                                                         isOpen,
                                                                                         onClose,
                                                                                         result
                                                                                     }) => {
    if (!isOpen || !result) return null;

    const successRate = PriceRecalculationUtils.getSuccessRate(result);
    const isCompletelySuccessful = PriceRecalculationUtils.isCompletelySuccessful(result);
    const formattedDate = PriceRecalculationUtils.formatProcessedAt(result);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isCompletelySuccessful ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                {isCompletelySuccessful ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Αποτελέσματα Επανυπολογισμού Τιμών
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Ολοκληρώθηκε με {successRate.toFixed(1)}% επιτυχία
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-6">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Συνολικά Προϊόντα</p>
                                    <p className="text-2xl font-bold text-blue-900">{result.totalProductsProcessed}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Ενημερώθηκαν</p>
                                    <p className="text-2xl font-bold text-green-900">{result.productsUpdated}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Παραλήφθηκαν</p>
                                    <p className="text-2xl font-bold text-yellow-900">{result.productsSkipped}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-yellow-500" />
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Αποτυχίες</p>
                                    <p className="text-2xl font-bold text-red-900">{result.productsFailed}</p>
                                </div>
                                <X className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Process Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ώρα Επεξεργασίας</p>
                                    <p className="text-sm text-gray-900">{formattedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Επεξεργάστηκε από</p>
                                    <p className="text-sm text-gray-900">{result.processedByUsername}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Failed Products */}
                    {result.failedProductCodes.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-red-900">
                                    Προϊόντα με Αποτυχίες ({result.failedProductCodes.length})
                                </h3>
                                <p className="text-sm text-red-700 mb-3">
                                    Τα παρακάτω προϊόντα δεν μπόρεσαν να ενημερωθούν:
                                </p>
                                <div className="max-h-32 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2">
                                        {result.failedProductCodes.map((code, index) => (
                                            <div key={index} className="bg-white px-3 py-2 rounded border border-red-200">
                                                <span className="text-sm font-mono text-red-800">{code}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {isCompletelySuccessful && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <div>
                                    <h3 className="text-lg font-medium text-green-900">
                                        Επιτυχής Ολοκλήρωση!
                                    </h3>
                                    <p className="text-green-700 text-sm">
                                        Όλες οι προτεινόμενες τιμές των προϊόντων ενημερώθηκαν με επιτυχία βάσει των τρεχόντων κοστών υλικών και διαδικασιών.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
                    <div className="flex justify-end">
                        <Button
                            onClick={onClose}
                            variant="primary"
                        >
                            Κλείσιμο
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceRecalculationResultModal;