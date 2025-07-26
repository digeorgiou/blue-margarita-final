import React from 'react';
import { Search, Eye, Edit, Trash2, Building2, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import type { SupplierReadOnlyDTO } from '../../../types/api/supplierInterface';

interface SupplierSearchBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    tinOnlyFilter: boolean;
    onTinOnlyFilterChange: (tinOnly: boolean) => void;
    searchResults: SupplierReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (supplier: SupplierReadOnlyDTO) => void;
    onEdit: (supplier: SupplierReadOnlyDTO) => void;
    onDelete: (supplier: SupplierReadOnlyDTO) => void;
}

const SupplierSearchBar: React.FC<SupplierSearchBarProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 tinOnlyFilter,
                                                                 onTinOnlyFilterChange,
                                                                 searchResults,
                                                                 loading,
                                                                 onViewDetails,
                                                                 onEdit,
                                                                 onDelete
                                                             }) => {
    // Helper function to determine if supplier has TIN
    const supplierHasTin = (supplier: SupplierReadOnlyDTO) => {
        return supplier.tin && supplier.tin.trim() !== '';
    };

    // Filter results based on TIN filter
    const filteredResults = tinOnlyFilter
        ? searchResults.filter(supplierHasTin)
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
                        placeholder="Αναζήτηση προμηθευτών (όνομα, email, τηλέφωνο, ΑΦΜ)..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                </div>

                {/* TIN Only Filter Checkbox */}
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                    <input
                        type="checkbox"
                        id="tinOnlyFilter"
                        checked={tinOnlyFilter}
                        onChange={(e) => onTinOnlyFilterChange(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="tinOnlyFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Μόνο με ΑΦΜ
                    </label>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner/>
                        <p className="mt-4 text-gray-600">Αναζήτηση προμηθευτών...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="p-8 text-center">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν προμηθευτές
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() || tinOnlyFilter
                                ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε έναν νέο προμηθευτή.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Results Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium text-gray-900">
                                        {filteredResults.length} προμηθευτές
                                    </span>
                                </div>
                                {tinOnlyFilter && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                        Μόνο με ΑΦΜ
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Supplier List */}
                        {filteredResults.map((supplier) => (
                            <div
                                key={supplier.supplierId}
                                className="p-6 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {/* Supplier Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {supplier.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    ID: {supplier.supplierId}
                                                    {!supplier.isActive && (
                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                            Ανενεργός
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Supplier Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            {/* Email */}
                                            {supplier.email && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate" title={supplier.email}>
                                                        {supplier.email}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Phone */}
                                            {supplier.phoneNumber && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{supplier.phoneNumber}</span>
                                                </div>
                                            )}

                                            {/* Address */}
                                            {supplier.address && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate" title={supplier.address}>
                                                        {supplier.address}
                                                    </span>
                                                </div>
                                            )}

                                            {/* TIN */}
                                            {supplier.tin && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                                    <span>ΑΦΜ: {supplier.tin}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(supplier)}
                                            variant="outline-primary"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(supplier)}
                                            variant="outline-secondary"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(supplier)}
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

export default SupplierSearchBar;