import React from 'react';
import { Search, Eye, Edit, Trash2, Users, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import type { CustomerListItemDTO } from '../../../types/api/customerInterface';
import { CustomTextInput, CustomToggleOption } from "../inputs";
import { CustomerFilterPanelProps } from "../../../types/components/filterPanel-types.ts";

const CustomerFilterPanel: React.FC<CustomerFilterPanelProps> = ({
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
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <CustomTextInput
                        label=""
                        value={searchTerm}
                        onChange={onSearchTermChange}
                        placeholder="Αναζήτηση με όνομα, email, τηλέφωνο ή ΑΦΜ..."
                        icon={<Search className="w-5 h-5 text-gray-400" />}
                        className="w-full"
                    />
                </div>

                {/* TIN Filter */}
                <div className="lg:w-64 flex items-end">
                    <CustomToggleOption
                        value={tinOnlyFilter}
                        onChange={onTinOnlyFilterChange}
                        optionLabel="Μόνο πελάτες Χονδρικής"
                        className="pb-2"
                    />
                </div>
            </div>

            {/* Results */}
            <div className="border-t pt-6">
                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                )}

                {!loading && filteredResults.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Δεν βρέθηκαν πελάτες
                        </h3>
                        <p className="text-gray-500">
                            {tinOnlyFilter && searchResults.length > 0
                                ? `Από τους ${searchResults.length} πελάτες, κανένας δεν έχει ΑΦΜ`
                                : searchTerm.length > 0
                                    ? `Δεν υπάρχουν πελάτες που να ταιριάζουν με "${searchTerm}"`
                                    : "Δεν υπάρχουν πελάτες στο σύστημα"
                            }
                        </p>
                    </div>
                )}
                {!loading && filteredResults.length > 0 && (
                    <div className="grid gap-4">
                        {filteredResults.map((customer) => (
                            <div
                                key={customer.customerId}
                                className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Customer Info */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {customer.firstname} {customer.lastname}
                                            </h3>
                                            {customerHasTin(customer) && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    Χονδρικής
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                            {customer.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span>{customer.email}</span>
                                                </div>
                                            )}
                                            {customer.phoneNumber && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{customer.phoneNumber}</span>
                                                </div>
                                            )}
                                            {customer.address && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{customer.address}</span>
                                                </div>
                                            )}
                                            {customer.tin && (
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                                    <span>ΑΦΜ: {customer.tin}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => onViewDetails(customer)}
                                            variant="info"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Προβολή
                                        </Button>
                                        <Button
                                            onClick={() => onEdit(customer)}
                                            variant="teal"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Επεξεργασία
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(customer)}
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

export default CustomerFilterPanel;