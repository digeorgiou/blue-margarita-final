import React from 'react';
import { Search, Eye, Edit, Trash2, Package, Calendar, User, Euro, Ruler } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import type { MaterialReadOnlyDTO } from '../../../types/api/materialInterface';

interface MaterialSearchBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    activeOnlyFilter: boolean;
    onActiveOnlyFilterChange: (activeOnly: boolean) => void;
    searchResults: MaterialReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (material: MaterialReadOnlyDTO) => void;
    onEdit: (material: MaterialReadOnlyDTO) => void;
    onDelete: (material: MaterialReadOnlyDTO) => void;
}

const MaterialSearchBar: React.FC<MaterialSearchBarProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 activeOnlyFilter,
                                                                 onActiveOnlyFilterChange,
                                                                 searchResults,
                                                                 loading,
                                                                 onViewDetails,
                                                                 onEdit,
                                                                 onDelete
                                                             }) => {
    // Helper function to format dates
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Δεν υπάρχει';
        return new Date(dateString).toLocaleDateString('el-GR');
    };

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Filter results based on active only filter
    const filteredResults = activeOnlyFilter
        ? searchResults.filter(material => material.isActive)
        : searchResults;

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Αναζήτηση υλικών (όνομα, περιγραφή)..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                </div>

                {/* Active Only Filter Checkbox */}
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                    <input
                        type="checkbox"
                        id="activeOnlyFilter"
                        checked={activeOnlyFilter}
                        onChange={(e) => onActiveOnlyFilterChange(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="activeOnlyFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Μόνο ενεργά
                    </label>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner/>
                        <p className="mt-4 text-gray-600">Αναζήτηση υλικών...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν υλικά
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() || activeOnlyFilter
                                ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε ένα νέο υλικό.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Results Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-gray-900">
                                        {filteredResults.length} υλικά
                                    </span>
                                </div>
                                {activeOnlyFilter && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Μόνο ενεργά
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Material List */}
                        {filteredResults.map((material) => (
                            <div
                                key={material.materialId}
                                className="p-6 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {/* Material Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {material.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    ID: {material.materialId}
                                                    {!material.isActive && (
                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                            Ανενεργό
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Material Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            {/* Unit Cost */}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Euro className="w-4 h-4 text-gray-400" />
                                                <span>Κόστος: {formatCurrency(material.currentUnitCost)}</span>
                                            </div>

                                            {/* Unit of Measure */}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Ruler className="w-4 h-4 text-gray-400" />
                                                <span>Μονάδα: {material.unitOfMeasure}</span>
                                            </div>

                                            {/* Created Date */}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>Δημιουργήθηκε: {formatDate(material.createdAt)}</span>
                                            </div>

                                            {/* Created By */}
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="truncate" title={material.createdBy}>
                                                    Από: {material.createdBy}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Note: MaterialReadOnlyDTO doesn't have supplierName field */}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(material)}
                                            variant="outline-primary"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(material)}
                                            variant="outline-secondary"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(material)}
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

export default MaterialSearchBar;