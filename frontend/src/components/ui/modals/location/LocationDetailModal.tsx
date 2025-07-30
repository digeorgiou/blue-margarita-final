import React from 'react';
import { X, MapPin, TrendingUp, ShoppingBag, Euro, Calendar, Package } from 'lucide-react';
import { Button } from '../../index.ts';
import type { LocationDetailedViewDTO } from '../../../../types/api/locationInterface';

interface LocationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: LocationDetailedViewDTO;
}

const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     location
                                                                 }) => {
    if (!isOpen) return null;

    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Ποτέ';
        return new Date(dateString).toLocaleDateString('el-GR');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{location.name}</h2>
                                <p className="text-gray-600">Λεπτομερείς αναλυτικές πληροφορίες τοποθεσίας</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Βασικές Πληροφορίες
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">ID Τοποθεσίας:</span>
                                <p className="text-gray-900">{location.locationId}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Κατάσταση:</span>
                                <p className={location.isActive ? 'text-green-600' : 'text-red-600'}>
                                    {location.isActive ? 'Ενεργή' : 'Ανενεργή'}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Δημιουργήθηκε:</span>
                                <p className="text-gray-900">{formatDate(location.createdAt)}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Τελευταία ενημέρωση:</span>
                                <p className="text-gray-900">{formatDate(location.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sales Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-xs font-medium uppercase tracking-wide">Συνολικά Έσοδα</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatMoney(location.totalRevenue)}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                                    <Euro className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-xs font-medium uppercase tracking-wide">Συνολικές Πωλήσεις</p>
                                    <p className="text-2xl font-bold text-green-900">{location.totalSalesCount}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-600 text-xs font-medium uppercase tracking-wide">Μέσος Όρος Αξίας Πώλησης</p>
                                    <p className="text-2xl font-bold text-purple-900">{formatMoney(location.averageOrderValue)}</p>
                                </div>
                                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-600 text-xs font-medium uppercase tracking-wide">Τελευταία Πώληση</p>
                                    <p className="text-lg font-bold text-orange-900">{formatDate(location.lastSaleDate)}</p>
                                </div>
                                <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                Απόδοση τελευταίων 30 ημερών
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Πωλήσεις:</span>
                                    <span className="font-semibold">{location.recentSalesCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Έσοδα:</span>
                                    <span className="font-semibold">{formatMoney(location.recentRevenue)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                Ετήσια Απόδοση
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Πωλήσεις:</span>
                                    <span className="font-semibold">{location.yearlySalesCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Έσοδα:</span>
                                    <span className="font-semibold">{formatMoney(location.yearlySalesRevenue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-gray-600" />
                            Κορυφαία Προϊόντα σε αυτή την Τοποθεσία
                        </h4>

                        {location.topProducts && location.topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {location.topProducts.map((product, index) => (
                                    <div key={product.productId} className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{product.productName}</h5>
                                                    <p className="text-sm text-gray-500">Κωδικός: {product.productCode}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {product.totalItemsSold} πωλήσεις
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {formatMoney(product.totalRevenue)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Τελευταία: {formatDate(product.lastSaleDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Δεν υπάρχουν δεδομένα προϊόντων για αυτή την τοποθεσία</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                        <Button
                            variant="primary"
                            onClick={onClose}
                        >
                            Κλείσιμο
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailModal;