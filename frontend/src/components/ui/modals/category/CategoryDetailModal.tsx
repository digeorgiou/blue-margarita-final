import React from 'react';
import { X, Gem, TrendingUp, ShoppingBag, Euro, Calendar, Package } from 'lucide-react';
import { Button } from '../../common';
import type { CategoryDetailModalProps } from "../../../../types/components/modal-types.ts";
import { formatMoney, formatDate } from "../../../../utils/formatters.ts";

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     category
                                                                 }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <Gem className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h2>
                                <p className="text-gray-600">Aναλυτικές πληροφορίες κατηγορίας</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Product Statistics */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Στατιστικά Προϊόντων
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Συνολικά προϊόντα</p>
                                    <p className="text-2xl font-bold text-blue-600">{category.totalProductsInCategory}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Μέση τιμή προϊόντος</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatMoney(category.averageProductPrice)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sales Performance */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Απόδοση Πωλήσεων
                            </h3>

                            {/* All-time Stats */}
                            <div className="mb-4">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Όλων των εποχών</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Συνολικά έσοδα</p>
                                        <p className="text-xl font-bold text-green-600">{formatMoney(category.totalRevenue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Συνολικές πωλήσεις</p>
                                        <p className="text-xl font-bold text-green-600">{category.totalSalesCount.toLocaleString('el-GR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Μέση αξία παραγγελίας</p>
                                        <p className="text-xl font-bold text-green-600">{formatMoney(category.averageOrderValue)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Performance (30 days) */}
                            <div className="mb-4">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Τελευταίες 30 ημέρες</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Πωλήσεις</p>
                                        <p className="text-lg font-semibold text-gray-900">{category.recentSalesCount.toLocaleString('el-GR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Έσοδα</p>
                                        <p className="text-lg font-semibold text-gray-900">{formatMoney(category.recentRevenue)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Yearly Performance */}
                            <div className="mb-4">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Φετινή χρονιά</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Πωλήσεις</p>
                                        <p className="text-lg font-semibold text-gray-900">{category.yearlySalesCount.toLocaleString('el-GR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Έσοδα</p>
                                        <p className="text-lg font-semibold text-gray-900">{formatMoney(category.yearlySalesRevenue)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Last Sale Date */}
                            <div>
                                <p className="text-sm text-gray-600">Τελευταία πώληση</p>
                                <p className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDate(category.lastSaleDate)}
                                </p>
                            </div>
                        </div>

                        {/* Top Products */}
                        {category.topProducts && category.topProducts.length > 0 && (
                            <div className="bg-purple-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <Euro className="w-5 h-5 mr-2" />
                                    Κορυφαία Προϊόντα στην Κατηγορία
                                </h3>
                                <div className="space-y-3">
                                    {category.topProducts.slice(0, 5).map((product, index) => (
                                        <div key={product.productId} className="bg-white rounded-lg p-3 border border-purple-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                                                        <p className="text-sm text-gray-500">Κωδικός: {product.productCode}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">{formatMoney(product.totalRevenue)}</p>
                                                    <p className="text-sm text-gray-500">{product.totalItemsSold} τεμάχια</p>
                                                    <p className="text-xs text-gray-400">Τελευταία: {formatDate(product.lastSaleDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {category.topProducts.length > 5 && (
                                    <div className="mt-3 text-center">
                                        <p className="text-sm text-gray-500">
                                            Εμφανίζονται τα 5 καλύτερα από {category.topProducts.length} προϊόντα
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State for Top Products */}
                        {(!category.topProducts || category.topProducts.length === 0) && (
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Δεν υπάρχουν προϊόντα με πωλήσεις σε αυτή την κατηγορία</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                        <Button
                            type="button"
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

export default CategoryDetailModal;