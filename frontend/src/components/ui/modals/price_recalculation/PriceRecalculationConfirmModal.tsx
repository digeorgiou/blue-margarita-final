import React from 'react';
import { AlertTriangle, Calculator, Clock, Database } from 'lucide-react';
import { Button } from '../../common';
import { PriceRecalculationConfirmModalProps } from "../../../../types/components/modal-types.ts";

const PriceRecalculationConfirmModal: React.FC<PriceRecalculationConfirmModalProps> = ({
                                                                                           isOpen,
                                                                                           onClose,
                                                                                           onConfirm,
                                                                                           isLoading = false
                                                                                       }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Επανυπολογισμός Τιμών Προϊόντων
                            </h2>
                            <p className="text-sm text-gray-600">Επιβεβαίωση bulk λειτουργίας</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm leading-relaxed">
                            <strong>Προσοχή:</strong> Αυτή η λειτουργία θα επανυπολογίσει τις προτεινόμενες τιμές
                            για <strong>ΌΛΑ</strong> τα ενεργά προϊόντα βάσει των τρεχόντων κοστών υλικών και διαδικασιών.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <Calculator className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Τι θα γίνει:</p>
                                <p className="text-sm text-gray-600">
                                    Οι προτεινόμενες τιμές λιανικής και χονδρικής θα ενημερωθούν για όλα τα προϊόντα
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Database className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Ασφάλεια:</p>
                                <p className="text-sm text-gray-600">
                                    Οι τελικές τιμές πώλησης δεν θα αλλάξουν - μόνο οι προτεινόμενες
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Διάρκεια:</p>
                                <p className="text-sm text-gray-600">
                                    Η διαδικασία μπορεί να διαρκέσει μερικά δευτερόλεπτα
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={onClose}
                            variant="outline-secondary"
                            disabled={isLoading}
                        >
                            Άκυρο
                        </Button>
                        <Button
                            onClick={onConfirm}
                            variant="warning"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Επεξεργασία...' : 'Επιβεβαίωση'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceRecalculationConfirmModal;