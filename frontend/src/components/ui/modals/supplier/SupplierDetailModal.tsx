import React from 'react';
import {
    Building2,
    Phone,
    Mail,
    MapPin,
    ReceiptText,
    Calendar,
    TrendingUp,
    Package,
    ShoppingCart,
    Euro,
    X
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../common';
import { SupplierDetailModalProps } from '../../../../types/components/modal-types';
import { formatCurrency, formatNumber, formatDate } from "../../../../utils/formatters.ts";

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     supplier,
                                                                     loading
                                                                 }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Στοιχεία Προμηθευτή</h2>
                            <p className="text-teal-100 text-sm">Λεπτομερής προβολή και στατιστικά συνεργασίας</p>
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
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <LoadingSpinner/>
                            <p className="mt-4 text-gray-600">Φόρτωση στοιχείων προμηθευτή...</p>
                        </div>
                    </div>
                ) : !supplier ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Δεν βρέθηκαν στοιχεία προμηθευτή
                            </h3>
                            <p className="text-gray-500">
                                Τα στοιχεία του προμηθευτή δεν είναι διαθέσιμα αυτή τη στιγμή.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-teal-600" />
                                Βασικά Στοιχεία
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Company Info */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">
                                            {supplier.name}
                                        </h4>
                                        <p className="text-gray-500">ID: {supplier.supplierId}</p>
                                        <span className={`inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full ${
                                            supplier.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {supplier.isActive ? 'Ενεργός' : 'Ανενεργός'}
                                        </span>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-3">
                                        {supplier.phoneNumber && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">{supplier.phoneNumber}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                                <span className="text-gray-900">{supplier.address}</span>
                                            </div>
                                        )}
                                        {supplier.tin && (
                                            <div className="flex items-center gap-2">
                                                <ReceiptText className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">ΑΦΜ: {supplier.tin}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Metadata */}
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-medium text-gray-500">Δημιουργήθηκε:</span>
                                        <p className="text-gray-900">{formatDate(supplier.createdAt)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-500">Τελευταία Ενημέρωση:</span>
                                        <p className="text-gray-900">{formatDate(supplier.updatedAt)}</p>
                                    </div>
                                    {supplier.deletedAt && (
                                        <div>
                                            <span className="font-medium text-red-500">Διαγράφηκε:</span>
                                            <p className="text-red-700">{formatDate(supplier.deletedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Purchase Statistics */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                                {`Στατιστικά Αγορών απο ${supplier.name} `}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatNumber(supplier.totalPurchases)}
                                    </div>
                                    <div className="text-sm text-gray-600">Συνολικές Αγορές</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Euro className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(supplier.totalCostPaid)}
                                    </div>
                                    <div className="text-sm text-gray-600">Συνολικό Κόστος</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(supplier.averagePurchaseValue)}
                                    </div>
                                    <div className="text-sm text-gray-600">Μέση Αξία Αγοράς</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatDate(supplier.lastPurchaseDate)}
                                    </div>
                                    <div className="text-sm text-gray-600">Τελευταία Αγορά</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Materials */}
                        {supplier.topMaterials && supplier.topMaterials.length > 0 && (
                            <div className="bg-teal-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-teal-600" />
                                    Κορυφαία Υλικά που Προμηθεύει
                                </h3>

                                <div className="space-y-3">
                                    {supplier.topMaterials.map((material) => (
                                        <div
                                            key={material.materialId}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-teal-200"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {material.materialName}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Package className="w-4 h-4" />
                                                        Ποσότητα: {formatNumber(material.totalQuantityPurchased)}
                                                    </span>
                                                    <span className="ml-4 inline-flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Τελευταία αγορά: {formatDate(material.lastPurchaseDate)}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-semibold text-gray-900">
                                                    {formatCurrency(material.totalCostPaid)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Συνολικό κόστος
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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

export default SupplierDetailModal;