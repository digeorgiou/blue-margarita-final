import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Hash,
    Tag,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../common';
import { ProductUsageDTO } from '../../../../types/api/materialInterface';
import { Paginated } from '../../../../types/api/dashboardInterface';
import { materialService } from '../../../../services/materialService';
import { useFormErrorHandler } from '../../../../hooks/useFormErrorHandler';
import { ProductUsageModalProps } from '../../../../types/components/modal-types';
import { formatCurrency, formatNumber } from "../../../../utils/formatters.ts";

const MaterialProductUsageModal: React.FC<ProductUsageModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 material
                                                             }) => {
    // State for pagination and filtering
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // Data state
    const [products, setProducts] = useState<Paginated<ProductUsageDTO> | null>(null);
    const [loading, setLoading] = useState(false);

    // Error handling
    const { generalError, handleApiError, clearErrors } = useFormErrorHandler();

    // Load products when modal opens or filters change
    useEffect(() => {
        if (isOpen && material) {
            loadProducts();
        }
    }, [isOpen, material, currentPage, pageSize, searchTerm, selectedCategoryId]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(0);
            setSearchTerm('');
            setSelectedCategoryId(null);
            clearErrors();
        }
    }, [isOpen]);

    const loadProducts = async () => {
        if (!material) return;

        setLoading(true);
        try {
            const result = await materialService.getAllProductsUsingMaterial(material.materialId, {
                nameOrCode: searchTerm.trim() || undefined,
                categoryId: selectedCategoryId || undefined,
                page: currentPage,
                pageSize: pageSize
            });
            setProducts(result);
        } catch (error) {
            await handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen && material) {
                setCurrentPage(0); // Reset to first page when searching
                loadProducts();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">
                                Προϊόντα που χρησιμοποιούν: {material?.name}
                            </h2>
                            <p className="text-green-100 text-sm">
                                Λίστα προϊόντων με ποσότητες χρήσης και επίδραση κόστους
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Αναζήτηση προϊόντων (όνομα ή κωδικός)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Page Size Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Ανά σελίδα:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {generalError && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{generalError}</p>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-600">Φόρτωση προϊόντων...</p>
                            </div>
                        </div>
                    ) : !products || products.data.length === 0 ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Δεν βρέθηκαν προϊόντα
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm
                                        ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης.'
                                        : 'Δεν υπάρχουν προϊόντα που χρησιμοποιούν αυτό το υλικό.'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Results Summary */}
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Εμφάνιση {products.numberOfElements} από {products.totalElements} προϊόντα
                                </p>
                                <div className="text-sm text-gray-500">
                                    Σελίδα {products.currentPage + 1} από {products.totalPages}
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="space-y-4">
                                {products.data.map((product) => (
                                    <div
                                        key={product.productId}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Product Header */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {product.productName}
                                                        </h4>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Hash className="w-4 h-4" />
                                                                <span>Κωδικός: {product.productCode}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Tag className="w-4 h-4" />
                                                                <span>Κατηγορία: {product.categoryName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Usage Details */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                                    <div className="bg-blue-50 rounded-lg p-3">
                                                        <div className="text-sm text-blue-600 font-medium">
                                                            Ποσότητα Χρήσης
                                                        </div>
                                                        <div className="text-xl font-bold text-blue-900">
                                                            {formatNumber(product.usageQuantity)}
                                                        </div>
                                                        <div className="text-xs text-blue-600">
                                                            ανά μονάδα προϊόντος
                                                        </div>
                                                    </div>

                                                    <div className="bg-green-50 rounded-lg p-3">
                                                        <div className="text-sm text-green-600 font-medium">
                                                            Επίδραση Κόστους
                                                        </div>
                                                        <div className="text-xl font-bold text-green-900">
                                                            {formatCurrency(product.costImpact)}
                                                        </div>
                                                        <div className="text-xs text-green-600">
                                                            στο κόστος παραγωγής
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {products && products.totalPages > 1 && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Σελίδα {products.currentPage + 1} από {products.totalPages}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handlePageChange(products.currentPage - 1)}
                                    disabled={products.currentPage === 0}
                                    variant="outline-secondary"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Προηγούμενη
                                </Button>

                                <span className="px-3 py-1 bg-white border border-gray-200 rounded text-sm">
                                    {products.currentPage + 1}
                                </span>

                                <Button
                                    onClick={() => handlePageChange(products.currentPage + 1)}
                                    disabled={products.currentPage >= products.totalPages - 1}
                                    variant="outline-secondary"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    Επόμενη
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
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

export default MaterialProductUsageModal;