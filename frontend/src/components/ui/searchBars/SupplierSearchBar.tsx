import React from 'react';
import { Search, Eye, Edit, Trash2, Building2, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import type { SupplierReadOnlyDTO } from '../../../types/api/supplierInterface';
import { CustomTextInput } from "../inputs";

interface SupplierSearchBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: SupplierReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (supplier: SupplierReadOnlyDTO) => void;
    onEdit: (supplier: SupplierReadOnlyDTO) => void;
    onDelete: (supplier: SupplierReadOnlyDTO) => void;
}

const SupplierSearchBar: React.FC<SupplierSearchBarProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 searchResults,
                                                                 loading,
                                                                 onViewDetails,
                                                                 onEdit,
                                                                 onDelete
                                                             }) => {
    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <CustomTextInput
                        label=""
                        placeholder="Αναζήτηση με όνομα, ΑΦΜ, τηλέφωνο ή email..."
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        icon={<Search className="w-5 h-5 text-gray-400" />}
                        className="w-full"
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Results Section */}
            <div className="border-t pt-6">
                {loading && (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner/>
                    </div>
                ) }
                {!loading && searchResults.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg mb-2">Δεν βρέθηκαν προμηθευτές</p>
                                <p className="text-sm">
                                    {searchTerm.length > 0 ?
                                        'Δοκιμάστε διαφορετικούς όρους αναζήτησης' :
                                        'Ξεκινήστε πληκτρολογώντας για αναζήτηση'
                                    }
                                </p>
                            </div>
                        )}
                {!loading && searchResults.length > 0 && (
                            <div className="grid gap-4">
                                {searchResults.map((supplier) => (
                                    <div
                                        key={supplier.supplierId}
                                        className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            {/* Supplier Info */}
                                            <div className="flex-1 space-y-2">
                                                {/* Supplier Name */}
                                                <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {supplier.name}
                                                        </h3>
                                                </div>

                                                {/* Contact Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    {/* Email */}
                                                    {supplier.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                            <span className="truncate" title={supplier.email}>
                                                                {supplier.email}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Phone */}
                                                    {supplier.phoneNumber && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-gray-400" />
                                                            <span>{supplier.phoneNumber}</span>
                                                        </div>
                                                    )}

                                                    {/* Address */}
                                                    {supplier.address && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            <span className="truncate" title={supplier.address}>
                                                                {supplier.address}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* TIN */}
                                                    {supplier.tin && (
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                                            <span>ΑΦΜ: {supplier.tin}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    onClick={() => onViewDetails(supplier)}
                                                    variant= "info"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Προβολή
                                                </Button>
                                                <Button
                                                    onClick={() => onEdit(supplier)}
                                                    variant= "teal"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Επεξεργασία
                                                </Button>
                                                <Button
                                                    onClick={() => onDelete(supplier)}
                                                    variant= "danger"
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