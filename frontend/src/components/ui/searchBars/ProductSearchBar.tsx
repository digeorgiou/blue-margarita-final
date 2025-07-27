// ProductSearchBar.tsx - Following MaterialSearchBar pattern with all product filters

import React from 'react';
import { Search, Package, Edit, Trash2, Eye } from 'lucide-react';
import { Button, LoadingSpinner } from '../index';
import type { ProductListItemDTO } from '../../../types/api/productInterface';

interface ProductSearchBarProps {
    // Basic search
    searchTerm: string;
    onSearchTermChange: (value: string) => void;

    // Category filter
    selectedCategoryId: number | undefined;
    onCategoryIdChange: (value: number | undefined) => void;
    categories: { id: number; name: string }[];

    // Material filter
    materialName: string;
    onMaterialNameChange: (value: string) => void;

    // Procedure filter
    selectedProcedureId: number | undefined;
    onProcedureIdChange: (value: number | undefined) => void;
    procedures: { id: number; name: string }[];

    // Price filters
    minPrice: string;
    onMinPriceChange: (value: string) => void;
    maxPrice: string;
    onMaxPriceChange: (value: string) => void;

    // Stock filters
    stockStatus: string;
    onStockStatusChange: (value: string) => void;

    // Active filter
    activeOnlyFilter: boolean;
    onActiveOnlyFilterChange: (value: boolean) => void;

    // Results and actions
    searchResults: ProductListItemDTO[];
    loading: boolean;
    onViewDetails: (product: ProductListItemDTO) => void;
    onEdit: (product: ProductListItemDTO) => void;
    onDelete: (product: ProductListItemDTO) => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
                                                               searchTerm,
                                                               onSearchTermChange,
                                                               selectedCategoryId,
                                                               onCategoryIdChange,
                                                               categories,
                                                               materialName,
                                                               onMaterialNameChange,
                                                               selectedProcedureId,
                                                               onProcedureIdChange,
                                                               procedures,
                                                               minPrice,
                                                               onMinPriceChange,
                                                               maxPrice,
                                                               onMaxPriceChange,
                                                               stockStatus,
                                                               onStockStatusChange,
                                                               activeOnlyFilter,
                                                               onActiveOnlyFilterChange,
                                                               searchResults,
                                                               loading,
                                                               onViewDetails,
                                                               onEdit,
                                                               onDelete
                                                           }) => {
    // Filter results based on current filters (client-side filtering for display)
    const filteredResults = activeOnlyFilter
        ? searchResults.filter(product => product.isActive)
        : searchResults;

    // Stock status options
    const stockStatusOptions = [
        { value: '', label: 'Όλα τα προϊόντα' },
        { value: 'low_stock', label: 'Χαμηλό απόθεμα' },
        { value: 'in_stock', label: 'Σε απόθεμα' },
        { value: 'out_of_stock', label: 'Εξαντλημένα' }
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(price);
    };

    const getStockStatusBadge = (product: ProductListItemDTO) => {
        if (product.currentStock <= 0) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Εξαντλημένο</span>;
        } else if (product.isLowStock) {
            return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Χαμηλό απόθεμα</span>;
        } else {
            return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Σε απόθεμα</span>;
        }
    };

    const getPriceDifferenceBadge = (percentageDifference: number) => {
        if (Math.abs(percentageDifference) < 5) {
            return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Σωστή τιμή</span>;
        } else if (percentageDifference > 0) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">+{percentageDifference.toFixed(1)}%</span>;
        } else {
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">{percentageDifference.toFixed(1)}%</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="space-y-4">
                {/* Primary Search Row */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    {/* Main Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Αναζήτηση προϊόντων (όνομα, κωδικός)..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="min-w-0 lg:w-48">
                        <select
                            value={selectedCategoryId || ''}
                            onChange={(e) => onCategoryIdChange(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Όλες οι κατηγορίες</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stock Status Dropdown */}
                    <div className="min-w-0 lg:w-48">
                        <select
                            value={stockStatus}
                            onChange={(e) => onStockStatusChange(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                            {stockStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Secondary Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    {/* Material Name Search */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Φίλτρο υλικού..."
                            value={materialName}
                            onChange={(e) => onMaterialNameChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                    </div>

                    {/* Procedure Dropdown */}
                    <div className="min-w-0 lg:w-48">
                        <select
                            value={selectedProcedureId || ''}
                            onChange={(e) => onProcedureIdChange(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        >
                            <option value="">Όλες οι διαδικασίες</option>
                            {procedures.map(procedure => (
                                <option key={procedure.id} value={procedure.id}>
                                    {procedure.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="Από €"
                            value={minPrice}
                            onChange={(e) => onMinPriceChange(e.target.value)}
                            className="w-24 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            min="0"
                            step="0.01"
                        />
                        <span className="text-gray-500 text-sm">-</span>
                        <input
                            type="number"
                            placeholder="Έως €"
                            value={maxPrice}
                            onChange={(e) => onMaxPriceChange(e.target.value)}
                            className="w-24 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* Active Only Filter */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <input
                            type="checkbox"
                            id="activeOnlyFilter"
                            checked={activeOnlyFilter}
                            onChange={(e) => onActiveOnlyFilterChange(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="activeOnlyFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Μόνο ενεργά
                        </label>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Αναζήτηση προϊόντων...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν προϊόντα
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() || selectedCategoryId || materialName.trim() || selectedProcedureId || stockStatus || minPrice || maxPrice || activeOnlyFilter
                                ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε ένα νέο προϊόν.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Results Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                        {filteredResults.length} προϊόντα
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {activeOnlyFilter && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            Μόνο ενεργά
                                        </span>
                                    )}
                                    {stockStatus && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            {stockStatusOptions.find(opt => opt.value === stockStatus)?.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product List */}
                        {filteredResults.map((product) => (
                            <div
                                key={product.id}
                                className="p-6 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {/* Product Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Κωδικός: {product.code} • Κατηγορία: {product.categoryName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Product Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Κόστος Παραγωγής</p>
                                                <p className="font-medium text-gray-900">{formatPrice(product.totalCost)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Προτεινόμενη Τιμή</p>
                                                <p className="font-medium text-gray-900">{formatPrice(product.suggestedRetailPrice)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Τελική Τιμή</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{formatPrice(product.finalRetailPrice)}</span>
                                                    {getPriceDifferenceBadge(product.percentageDifference)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Χρόνος Παραγωγής</p>
                                                <p className="font-medium text-gray-900">{product.minutesToMake} λεπτά</p>
                                            </div>
                                        </div>

                                        {/* Stock Information */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Απόθεμα:</span>
                                                <span className="font-medium text-gray-900">{product.currentStock}</span>
                                                {getStockStatusBadge(product)}
                                            </div>
                                            {product.lowStockAlert && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">Όριο συναγερμού:</span>
                                                    <span className="font-medium text-gray-900">{product.lowStockAlert}</span>
                                                </div>
                                            )}
                                            {!product.isActive && (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                    Ανενεργό
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(product)}
                                            variant="outline-primary"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(product)}
                                            variant="outline-secondary"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(product)}
                                            variant="danger"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Διαγραφή
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSearchBar;