// Updated CustomerSearchBar.tsx without built-in pagination

import React from 'react';
import { Search, Eye, Edit, Trash2, Users, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button, LoadingSpinner } from './../index';
import type { CustomerListItemDTO, Paginated } from '../../../types/api/customerInterface';

interface CustomerSearchBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    wholesaleOnly: boolean;
    onWholesaleOnlyChange: (wholesale: boolean) => void;
    searchResults: Paginated<CustomerListItemDTO>;
    loading: boolean;
    onViewDetails: (customer: CustomerListItemDTO) => void;
    onEdit: (customer: CustomerListItemDTO) => void;
    onDelete: (customer: CustomerListItemDTO) => void;
    // Removed onPageChange since pagination is handled externally
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
                                                                 searchTerm,
                                                                 onSearchTermChange,
                                                                 wholesaleOnly,
                                                                 onWholesaleOnlyChange,
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
                {/* Search Input */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Αναζήτηση πελάτη (όνομα, email, τηλέφωνο, ΑΦΜ)..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {searchTerm.length === 0
                            ? "Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες για αναζήτηση"
                            : searchTerm.length < 2
                                ? "Χρειάζονται τουλάχιστον 2 χαρακτήρες"
                                : `Αναζήτηση για: "${searchTerm}"`
                        }
                    </p>
                </div>

                {/* Wholesale Filter */}
                <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-300 hover:border-blue-400 transition-colors">
                        <input
                            type="checkbox"
                            checked={wholesaleOnly}
                            onChange={(e) => onWholesaleOnlyChange(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Μόνο Χονδρικής</span>
                    </label>
                </div>
            </div>

            {/* Results Section */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner/>
                </div>
            ) : searchTerm.length > 0 && searchTerm.length < 2 ? (
                <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες για αναζήτηση</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            {searchTerm.length === 0 ? 'Όλοι οι Πελάτες' : 'Αποτελέσματα Αναζήτησης'}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({searchResults?.totalElements || 0} πελάτες)
                            </span>
                        </h3>
                    </div>

                    {/* Customer Grid */}
                    {!searchResults || !searchResults.data || searchResults.data.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                {searchTerm.length === 0 ? 'Δεν υπάρχουν πελάτες' : 'Δεν βρέθηκαν πελάτες'}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {searchTerm.length === 0 ? 'Δημιουργήστε τον πρώτο πελάτη' : 'Δοκιμάστε διαφορετικό όρο αναζήτησης'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {searchResults.data.map((customer) => (
                                <CustomerCard
                                    key={customer.customerId}
                                    customer={customer}
                                    onViewDetails={onViewDetails}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* Removed pagination section - handled externally now */}
                </div>
            )}
        </div>
    );
};

// Customer Card Component (unchanged)
interface CustomerCardProps {
    customer: CustomerListItemDTO;
    onViewDetails: (customer: CustomerListItemDTO) => void;
    onEdit: (customer: CustomerListItemDTO) => void;
    onDelete: (customer: CustomerListItemDTO) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
                                                       customer,
                                                       onViewDetails,
                                                       onEdit,
                                                       onDelete
                                                   }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg group">
            <div className="p-6">
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {customer.firstname} {customer.lastname}
                            </h3>
                            <p className="text-sm text-gray-500">Πελάτης #{customer.customerId}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{customer.phoneNumber}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{customer.address}</span>
                    </div>
                    {customer.tin && (
                        <div className="flex items-center text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                            <span>ΑΦΜ: {customer.tin}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => onViewDetails(customer)}
                        className="flex-1 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Προβολή
                    </Button>
                    <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => onEdit(customer)}
                        className="flex-1 flex items-center justify-center hover:bg-green-50 hover:border-green-300"
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Επεξεργασία
                    </Button>
                    <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => onDelete(customer)}
                        className="flex-1 flex items-center justify-center hover:bg-red-50 hover:border-red-300 text-red-600"
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Διαγραφή
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CustomerSearchBar;