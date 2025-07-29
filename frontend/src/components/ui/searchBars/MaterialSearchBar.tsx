import React from 'react';
import { Search, Eye, Edit, Trash2, Package, Euro, Ruler } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import type { MaterialReadOnlyDTO } from '../../../types/api/materialInterface';
import { CustomTextInput } from "../inputs";

interface MaterialSearchBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: MaterialReadOnlyDTO[];
    loading: boolean;
    onViewDetails: (material: MaterialReadOnlyDTO) => void;
    onEdit: (material: MaterialReadOnlyDTO) => void;
    onDelete: (material: MaterialReadOnlyDTO) => void;
    onViewProducts: (material: MaterialReadOnlyDTO) => void;
}

const MaterialSearchBar: React.FC<MaterialSearchBarProps> = ({
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
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="flex-1">
                    <CustomTextInput
                        label=""
                        placeholder="Αναζήτηση υλικών (όνομα, περιγραφή)..."
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        icon={<Search className="w-5 h-5" />}
                        className="w-full"
                    />
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
                            {searchTerm.trim() ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε ένα νέο υλικό.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Material List */}
                        {filteredResults.map((material) => (
                            <div
                                key={material.materialId}
                                className="p-6 hover:bg-blue-100 transition-colors duration-150"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                                        </div>

                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            onClick={() => onViewDetails(material)}
                                            variant="info"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Λεπτομέρειες
                                        </Button>
                                        <Button
                                            onClick={() => onViewProducts(material)}
                                            variant="orange"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            title="Δείτε όλα τα προϊόντα που χρησιμοποιούν αυτό το υλικό"
                                        >
                                            <Package className="w-4 h-4" />
                                            Προϊόντα
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(material)}
                                            variant="teal"
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