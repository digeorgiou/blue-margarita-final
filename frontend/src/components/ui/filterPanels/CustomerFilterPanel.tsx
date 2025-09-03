import React from 'react';
import { Search, Users } from 'lucide-react';
import { LoadingSpinner } from '../common';
import type { CustomerListItemDTO } from '../../../types/api/customerInterface';
import { CustomTextInput, CustomToggleOption } from "../inputs";
import { CustomerFilterPanelProps } from "../../../types/components/filterPanel-types.ts";
import { CustomerCard } from '../resultCards'

const CustomerFilterPanel: React.FC<CustomerFilterPanelProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 tinOnlyFilter,
                                                                 onTinOnlyFilterChange,
                                                                 searchResults,
                                                                 loading,
                                                                 onViewDetails,
                                                                 onEdit,
                                                                 onDelete,
                                                                 showInactiveOnly = false,
                                                                 onRestore
                                                             }) => {
    // Helper function to determine if customer has TIN
    const customerHasTin = (customer: CustomerListItemDTO) => {
        return customer.tin && customer.tin.trim() !== '';
    };

    // Filter results based on TIN filter
    const filteredResults = tinOnlyFilter
        ? searchResults.filter(customerHasTin)
        : searchResults;

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="space-y-4">
                {/* Search Input */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    <CustomTextInput
                        label=""
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση με όνομα, email, τηλέφωνο ή ΑΦΜ..."
                        icon={<Search className="w-5 h-5 text-gray-400" />}
                        className="w-full"
                    />

                    {/* TIN Filter */}
                    <div className="flex items-center justify-center">
                        <CustomToggleOption
                            value={tinOnlyFilter}
                            onChange={onTinOnlyFilterChange}
                            optionLabel="Μόνο πελάτες Χονδρικής"
                            className="pb-2"
                        />
                    </div>
                </div>
            </div>

            {/* Results */}
            <div>
                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Αναζήτηση πελατών...</span>
                    </div>
                )}

                {!loading && filteredResults.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν πελάτες</h3>
                        <p className="text-gray-500">Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης</p>
                    </div>
                )}
                {!loading && filteredResults.length > 0 && (
                    <div className="space-y-4">
                        {filteredResults.map((customer) => (
                            <CustomerCard
                                key={customer.customerId}
                                customer={customer}
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

export default CustomerFilterPanel;