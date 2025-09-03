import React from 'react';
import { Search, Building2 } from 'lucide-react';
import { LoadingSpinner } from '../common';
import { CustomTextInput } from "../inputs";
import { SupplierFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { SupplierCard } from '../resultCards';

const SupplierFilterPanel: React.FC<SupplierFilterPanelProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 searchResults,
                                                                 loading,
                                                                 onViewDetails,
                                                                 onEdit,
                                                                 onDelete,
                                                                 showInactiveOnly = false,
                                                                 onRestore
                                                             }) => {
    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
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
            <div className="rounded-lg border border-gray-200">
                {loading && (
                    <div className= "bg-white flex items-center justify-center py-8">
                        <LoadingSpinner/>
                        <span className="ml-3 text-gray-600">Αναζήτηση προμηθευτών...</span>
                    </div>
                ) }
                {!loading && searchResults.length === 0 && (
                            <div className="text-center py-12">
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
                    <div className="space-y-4">
                        {searchResults.map((supplier) => (
                            <SupplierCard
                                key={supplier.supplierId}
                                supplier={supplier}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                showInactiveOnly={showInactiveOnly}
                                onRestore={onRestore}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierFilterPanel;