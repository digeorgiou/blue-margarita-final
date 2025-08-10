import React from 'react';
import { Search, Eye, Edit, Trash2, Package, Euro, Ruler } from 'lucide-react';
import { IoHammerOutline } from "react-icons/io5";
import { Button, LoadingSpinner } from './../index';
import { CustomTextInput } from "../inputs";
import { MaterialFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { MaterialCard } from '../resultCards'

const MaterialFilterPanel: React.FC<MaterialFilterPanelProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 searchResults,
                                                                 loading,
                                                                 onViewDetails,
                                                                 onEdit,
                                                                 onDelete,
                                                                 onViewProducts
                                                             }) => {

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Filter results based on active only filter
    const filteredResults = searchResults.filter(material => material.isActive);

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="space-y-4">
                {/* Search Input */}
                <div className="grid grid-cols-1 gap-4">
                    <CustomTextInput
                        label=""
                        placeholder="Αναζήτηση με όνομα υλικού..."
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Results */}
            <div>
                {loading ? (
                    <div className="bg-white flex items-center justify-center p-8">
                        <LoadingSpinner/>
                        <p className="ml-3 text-gray-600">Αναζήτηση υλικών...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν υλικά
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε ένα νέο υλικό.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {searchResults.map((material) => (
                            <MaterialCard
                                key={material.materialId}
                                material={material}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onViewProducts={onViewProducts}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialFilterPanel;