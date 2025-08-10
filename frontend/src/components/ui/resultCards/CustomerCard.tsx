import React from 'react';
import { Eye, Edit, Trash2, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button } from '../';
import type { CustomerListItemDTO } from '../../../types/api/customerInterface';

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
    // Helper function to determine if customer has TIN
    const customerHasTin = () => {
        return customer.tin && customer.tin.trim() !== '';
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {customer.firstname} {customer.lastname}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            {customerHasTin() ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    Χονδρικής
                                </span>
                            ) : <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    Λιανικής
                                </span> }
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4 ">

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customer.email && (
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{customer.email}</span>
                        </div>
                    )}

                    {customer.phoneNumber && (
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{customer.phoneNumber}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customer.address && (
                        <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 leading-relaxed">{customer.address}</span>
                        </div>
                    )}

                    {customer.tin && (
                        <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">ΑΦΜ: {customer.tin}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(customer)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Προβολή</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(customer)}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(customer)}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Διαγραφή</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerCard;