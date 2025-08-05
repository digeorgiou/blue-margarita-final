import React from 'react';
import { Search, Eye, Edit, Trash2, Package, Cog, Settings } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import { CustomTextInput } from "../inputs";
import { ProcedureFilterPanelProps } from "../../../types/components/filterPanel-types.ts";

const ProcedureFilterPanel: React.FC<ProcedureFilterPanelProps> = ({
                                                                   searchTerm,
                                                                   onSearchTermChange,
                                                                   searchResults,
                                                                   loading,
                                                                   onViewDetails,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onViewProducts
                                                               }) => {

    // Show all procedures (active and inactive)
    const filteredResults = searchResults;

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="flex-1">
                    <CustomTextInput
                        label=""
                        placeholder="Αναζήτηση με όνομα διαδικασίας..."
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
                        <p className="mt-4 text-gray-600">Αναζήτηση διαδικασιών...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="p-8 text-center">
                        <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν διαδικασίες
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm.trim() ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή αλλάξτε τα φίλτρα.'
                                : 'Ξεκινήστε αναζήτηση ή δημιουργήστε μια νέα διαδικασία.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {/* Procedure List */}
                        {filteredResults.map((procedure) => (
                            <div
                                key={procedure.procedureId}
                                className="p-6 hover:bg-blue-100 transition-colors duration-150"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Procedure Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Settings className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {procedure.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    ID: {procedure.procedureId}
                                                    {!procedure.isActive && (
                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                            Ανενεργή
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:ml-4">
                                        <Button
                                            onClick={() => onViewDetails(procedure)}
                                            variant="info"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Λεπτομέρειες
                                        </Button>
                                        <Button
                                            onClick={() => onViewProducts(procedure)}
                                            variant="orange"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            title="Δείτε όλα τα προϊόντα που χρησιμοποιούν αυτή τη διαδικασία"
                                        >
                                            <Package className="w-4 h-4" />
                                            Προϊόντα
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(procedure)}
                                            variant="teal"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(procedure)}
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

export default ProcedureFilterPanel;