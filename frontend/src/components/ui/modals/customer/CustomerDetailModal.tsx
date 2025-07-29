import React from 'react';
import { X, User, Calendar, TrendingUp, Package, Eye, Phone, Mail, MapPin, CreditCard, Euro } from 'lucide-react';
import { Button, LoadingSpinner } from '../../index';
import { CustomerDetailedViewDTO, getGenderTypeLabel } from '../../../../types/api/customerInterface';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerDetailedViewDTO | null;
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

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('el-GR').format(num);
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
                            <p className="text-indigo-100 text-sm">Προβολή στοιχείων και στατιστικών</p>
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
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Φόρτωση στοιχείων πελάτη...</span>
                    </div>
                ) : customer ? (
                    <div className="p-6 space-y-8">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Προσωπικά Στοιχεία
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Πλήρες Όνομα</span>
                                        <p className="text-lg font-semibold text-gray-900">{customer.fullName}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Φύλο</span>
                                        <p className="text-gray-900">{getGenderTypeLabel(customer.gender)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">ID Πελάτη</span>
                                        <p className="text-gray-900">#{customer.customerId}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Κατάσταση</span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            customer.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {customer.isActive ? 'Ενεργός' : 'Ανενεργός'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                                    Στοιχεία Επικοινωνίας
                                </h3>
                                <div className="space-y-3">
                                    {customer.phoneNumber && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{customer.phoneNumber}</span>
                                        </div>
                                    )}
                                    {customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                            <span className="text-gray-900">{customer.address}</span>
                                        </div>
                                    )}
                                    {customer.tin && (
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">ΑΦΜ: {customer.tin}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sales Statistics */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                Στατιστικά Πωλήσεων
                            </h3>

                            {/* All-time Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                                        <Euro className="w-5 h-5 mr-1" />
                                        {formatCurrency(customer.totalRevenue)}
                                    </div>
                                    <div className="text-sm text-gray-600">Συνολικά Έσοδα</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{formatNumber(customer.totalSalesCount)}</div>
                                    <div className="text-sm text-gray-600">Συνολικές Πωλήσεις</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(customer.averageOrderValue)}</div>
                                    <div className="text-sm text-gray-600">Μέση Αξία Παραγγελίας</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-orange-600">{formatDate(customer.lastOrderDate)}</div>
                                    <div className="text-sm text-gray-600">Τελευταία Παραγγελία</div>
                                </div>
                            </div>

                            {/* Recent Performance */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Τελευταίες 30 Ημέρες</h4>
                                    <div className="text-lg font-bold text-blue-600">{formatNumber(customer.recentSalesCount)} πωλήσεις</div>
                                    <div className="text-lg font-bold text-green-600">{formatCurrency(customer.recentRevenue)}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Φετινή Χρονιά</h4>
                                    <div className="text-lg font-bold text-blue-600">{formatNumber(customer.yearlySalesCount)} πωλήσεις</div>
                                    <div className="text-lg font-bold text-green-600">{formatCurrency(customer.yearlySalesRevenue)}</div>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Πρώτη Πώληση</h4>
                                    <div className="text-lg font-bold text-purple-600">{formatDate(customer.firstSaleDate)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        {customer.topProducts && customer.topProducts.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-green-600" />
                                    Κορυφαία Προϊόντα (Top {customer.topProducts.length})
                                </h3>
                                <div className="space-y-3">
                                    {customer.topProducts.map((product, index) => (
                                        <div key={product.productId} className="bg-white rounded-lg p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{product.productName}</h4>
                                                    <p className="text-sm text-gray-500">Κωδικός: {product.productCode}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-green-600">{formatCurrency(product.totalRevenue)}</div>
                                                <div className="text-sm text-gray-500">{formatNumber(product.totalItemsSold)} τεμάχια</div>
                                                <div className="text-xs text-gray-400">Τελευταία: {formatDate(product.lastSaleDate)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Account Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                                Πληροφορίες Λογαριασμού
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-500">Δημιουργήθηκε:</span>
                                    <p className="text-gray-900">{formatDate(customer.createdAt)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500">Τελευταία Ενημέρωση:</span>
                                    <p className="text-gray-900">{formatDate(customer.updatedAt)}</p>
                                </div>
                                {customer.deletedAt && (
                                    <div className="col-span-2">
                                        <span className="font-medium text-red-500">Διαγράφηκε:</span>
                                        <p className="text-red-700">{formatDate(customer.deletedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Δεν βρέθηκαν στοιχεία πελάτη
                            </h3>
                            <p className="text-gray-500">
                                Τα στοιχεία του πελάτη δεν είναι διαθέσιμα αυτή τη στιγμή.
                            </p>
                        </div>
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

export default CustomerDetailModal;