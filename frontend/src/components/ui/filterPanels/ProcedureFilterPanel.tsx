import React from 'react';
import { Cog, Search } from 'lucide-react';
import { LoadingSpinner } from '../common';
import { CustomTextInput } from "../inputs";
import { ProcedureFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { ProcedureCard } from '../resultCards';

const ProcedureFilterPanel: React.FC<ProcedureFilterPanelProps> = ({
                                                                   searchTerm,
                                                                   onSearchTermChange,
                                                                   searchResults,
                                                                   loading,
                                                                   onViewDetails,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onViewProducts,
                                                                   showInactiveOnly = false,
                                                                   onRestore
                                                               }) => {

    // Show all procedures (active and inactive)
    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="space-y-4">
                {/* Search Input */}
                <div className="grid grid-cols-1 gap-4">
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
            <div>
                {loading ? (
                    <div className="bg-white flex items-center justify-center p-8">
                        <LoadingSpinner/>
                        <p className="mt-4 text-gray-600">Αναζήτηση διαδικασιών...</p>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Cog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                    <div className="space-y-4">
                        {searchResults.map((procedure) => (
                            <ProcedureCard
                                key={procedure.procedureId}
                                procedure={procedure}
                                onViewDetails={onViewDetails}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onViewProducts={onViewProducts}
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

export default ProcedureFilterPanel;