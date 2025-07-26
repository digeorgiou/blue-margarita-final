import React from 'react';
import {
    Cog,
    Calendar,
    User,
    Package,
    TrendingUp,
    X
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { ProcedureDetailedViewDTO } from '../../../../types/api/procedureInterface';

interface ProcedureDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    procedure: ProcedureDetailedViewDTO | null;
    loading: boolean;
}

const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       procedure,
                                                                       loading
                                                                   }) => {
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Δεν υπάρχει';
        return new Date(dateString).toLocaleDateString('el-GR');
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('el-GR').format(num);
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
                                <Cog className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Στοιχεία Διαδικασίας
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Λεπτομερής προβολή και στατιστικά χρήσης
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
                            <p className="mt-4 text-gray-600">Φόρτωση στοιχείων διαδικασίας...</p>
                        </div>
                    ) : !procedure ? (
                        <div className="py-12 text-center">
                            <Cog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Δεν βρέθηκαν στοιχεία διαδικασίας</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Cog className="w-5 h-5" />
                                    Βασικά Στοιχεία
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-2xl font-bold text-gray-900">
                                                {procedure.name}
                                            </h5>
                                            <p className="text-gray-500">ID: {procedure.procedureId}</p>
                                            <span className={`inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full ${
                                                procedure.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {procedure.isActive ? 'Ενεργή' : 'Ανενεργή'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column - Audit Info */}
                                    <div className="space-y-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Δημιουργήθηκε: {formatDate(procedure.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Ενημερώθηκε: {formatDate(procedure.updatedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>Δημιουργός: {procedure.createdBy}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>Τελευταία ενημέρωση από: {procedure.lastUpdatedBy}</span>
                                        </div>
                                        {procedure.deletedAt && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Διαγράφηκε: {formatDate(procedure.deletedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Στατιστικά Χρήσης
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                            <Package className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatNumber(procedure.totalProductsUsing)}
                                        </div>
                                        <div className="text-sm text-gray-600">Προϊόντα που χρησιμοποιούν</div>
                                    </div>

                                </div>
                            </div>

                            {/* Top Products Using This Procedure */}
                            {procedure.topProductsUsage && procedure.topProductsUsage.length > 0 && (
                                <div className="bg-green-50 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Κορυφαία Προϊόντα
                                    </h4>

                                    <div className="space-y-3">
                                        {procedure.topProductsUsage.map((product) => (
                                            <div
                                                key={product.productId}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                                            >
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">
                                                        {product.productName}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                        Κωδικός: {product.productCode} |
                                                        Usage Count: {product.usageCount}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        {formatNumber(product.totalRevenue)} τεμάχια
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        total revenue
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

export default ProcedureDetailModal;