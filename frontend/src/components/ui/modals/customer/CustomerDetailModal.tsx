import React from 'react';
import { X, User, Calendar, TrendingUp, Package, Eye } from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { CustomerDetailedViewDTO, getGenderTypeLabel } from '../../../../types/api/customerInterface';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerDetailedViewDTO;
    loading: boolean;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     customer,
                                                                     loading
                                                                 }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Δεν υπάρχει';
        return new Intl.DateTimeFormat('el-GR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(dateString));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Λεπτομέρειες Πελάτη</h2>
                            <p className="text-indigo-100 text-sm">Προβολή πλήρων στοιχείων και στατιστικών</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner/>
                    </div>
                ) : (
                    <div className="p-6 space-y-8">
                        {/* Customer Basic Info */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                            <div className="flex items-start space-x-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                    <User className="w-10 h-10 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {customer.fullName}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <User className="w-4 h-4 mr-2" />
                                            <span>Πελάτης #{customer.customerId}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <User className="w-4 h-4 mr-2" />
                                            <span>{getGenderTypeLabel(customer.gender)}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>Μέλος από: {formatDate(customer.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${customer.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className={customer.isActive ? 'text-green-600' : 'text-red-600'}>
                                                {customer.isActive ? 'Ενεργός' : 'Ανενεργός'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                    Πληροφορίες Συστήματος
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Δημιουργήθηκε:</span>
                                        <span className="text-gray-700 ml-2">{formatDate(customer.createdAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Τελευταία ενημέρωση:</span>
                                        <span className="text-gray-700 ml-2">{formatDate(customer.updatedAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Δημιουργός:</span>
                                        <span className="text-gray-700 ml-2">{customer.createdBy}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Τελευταία επεξεργασία:</span>
                                        <span className="text-gray-700 ml-2">{customer.lastUpdatedBy}</span>
                                    </div>
                                    {customer.deletedAt && (
                                        <div>
                                            <span className="text-red-500">Διαγράφηκε:</span>
                                            <span className="text-red-700 ml-2">{formatDate(customer.deletedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sales Statistics */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                            <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                                Στατιστικά Πωλήσεων
                            </h4>

                            {/* All-time Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-blue-600">{customer.totalSalesCount}</div>
                                    <div className="text-sm text-gray-600">Συνολικές Πωλήσεις</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalRevenue)}</div>
                                    <div className="text-sm text-gray-600">Συνολικά Έσοδα</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(customer.averageOrderValue)}</div>
                                    <div className="text-sm text-gray-600">Μέσος Όρος Παραγγελίας</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                    <div className="text-sm font-medium text-gray-600">Τελευταία Παραγγελία</div>
                                    <div className="text-sm text-gray-800">{formatDate(customer.lastOrderDate)}</div>
                                </div>
                            </div>

                            {/* Period Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                                        Τελευταίες 30 Ημέρες
                                    </h5>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Πωλήσεις:</span>
                                            <span className="font-medium">{customer.recentSalesCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Έσοδα:</span>
                                            <span className="font-medium">{formatCurrency(customer.recentRevenue)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                        Φετινές Επιδόσεις
                                    </h5>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Πωλήσεις:</span>
                                            <span className="font-medium">{customer.yearlySalesCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Έσοδα:</span>
                                            <span className="font-medium">{formatCurrency(customer.yearlySalesRevenue)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {customer.firstSaleDate && (
                                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                    <div className="text-sm text-blue-800">
                                        <strong>Πρώτη πωλήσης:</strong> {formatDate(customer.firstSaleDate)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Products */}
                        {customer.topProducts && customer.topProducts.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Package className="w-6 h-6 mr-2 text-purple-600" />
                                    Κορυφαία Προϊόντα (Κατά Έσοδα)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {customer.topProducts.slice(0, 6).map((product, index) => (
                                        <div key={product.productId} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                        <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                                                    </div>
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                            <h5 className="font-medium text-gray-900 mb-1">{product.productName}</h5>
                                            <p className="text-xs text-gray-500 mb-2">{product.productCode}</p>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Τεμάχια:</span>
                                                    <span className="font-medium">{product.totalItemsSold}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Έσοδα:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(product.totalRevenue)}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Τελευταία: {formatDate(product.lastSaleDate)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <Button
                                onClick={onClose}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Κλείσιμο
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetailModal;