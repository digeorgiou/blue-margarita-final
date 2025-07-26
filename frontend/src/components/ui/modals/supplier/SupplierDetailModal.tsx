import React from 'react';
import {
    Building2,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Calendar,
    TrendingUp,
    Package,
    ShoppingCart,
    DollarSign,
    X
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { SupplierDetailedViewDTO } from '../../../../types/api/supplierInterface';

interface SupplierDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: SupplierDetailedViewDTO | null;
    loading: boolean;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     supplier,
                                                                     loading
                                                                 }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Δεν υπάρχει';
        return new Date(dateString).toLocaleDateString('el-GR');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Στοιχεία Προμηθευτή
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Λεπτομερής προβολή και στατιστικά
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost-primary"
                            size="sm"
                            className="p-2"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="py-12 text-center">
                            <LoadingSpinner/>
                            <p className="mt-4 text-gray-600">Φόρτωση στοιχείων προμηθευτή...</p>
                        </div>
                    ) : !supplier ? (
                        <div className="py-12 text-center">
                            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Δεν βρέθηκαν στοιχεία προμηθευτή</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    Βασικά Στοιχεία
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-2xl font-bold text-gray-900">
                                                {supplier.name}
                                            </h5>
                                            <p className="text-gray-500">ID: {supplier.supplierId}</p>
                                            {!supplier.isActive && (
                                                <span className="inline-block px-2 py-1 mt-2 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                    Ανενεργός
                                                </span>
                                            )}
                                        </div>

                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{supplier.email}</span>
                                            </div>
                                        )}

                                        {supplier.phoneNumber && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span>{supplier.phoneNumber}</span>
                                            </div>
                                        )}

                                        {supplier.address && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>{supplier.address}</span>
                                            </div>
                                        )}

                                        {supplier.tin && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <CreditCard className="w-4 h-4" />
                                                <span>ΑΦΜ: {supplier.tin}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - Audit Info */}
                                    <div className="space-y-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Δημιουργήθηκε: {formatDate(supplier.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Ενημερώθηκε: {formatDate(supplier.updatedAt)}</span>
                                        </div>
                                        <div>
                                            <span>Δημιουργός: {supplier.createdBy}</span>
                                        </div>
                                        <div>
                                            <span>Τελευταία ενημέρωση από: {supplier.lastUpdatedBy}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Statistics */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Στατιστικά Αγορών
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {supplier.totalPurchases}
                                        </div>
                                        <div className="text-sm text-gray-600">Συνολικές Αγορές</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                                            <DollarSign className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(supplier.totalCostPaid)}
                                        </div>
                                        <div className="text-sm text-gray-600">Συνολικό Κόστος</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                                            <TrendingUp className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(supplier.averagePurchaseValue)}
                                        </div>
                                        <div className="text-sm text-gray-600">Μέση Αξία Αγοράς</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                                            <Calendar className="w-6 h-6 text-purple-600" />
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
                                <div className="bg-green-50 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Κορυφαία Υλικά
                                    </h4>

                                    <div className="space-y-3">
                                        {supplier.topMaterials.map((material) => (
                                            <div
                                                key={material.materialId}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                                            >
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">
                                                        {material.materialName}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                        Ποσότητα: {material.totalQuantityPurchased} |
                                                        Τελευταία αγορά: {formatDate(material.lastPurchaseDate)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
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
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={onClose}
                            variant="primary"
                            className="px-6"
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