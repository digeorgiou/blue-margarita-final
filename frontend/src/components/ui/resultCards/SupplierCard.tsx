import React from 'react';
import { Eye, Edit, Trash2, Phone, Mail, MapPin, Hash } from 'lucide-react';
import { Button } from '../../common';
import type { SupplierCardProps } from "../../../types/components/resultCard-types.ts";

const SupplierCard: React.FC<SupplierCardProps> = ({
                                                       supplier,
                                                       onViewDetails,
                                                       onEdit,
                                                       onDelete
                                                   }) => {

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">

                {/* Header with supplier name and status */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                           {supplier.name}
                        </h3>
                    </div>
                </div>
            </div>

                {/* Contact Information */}
            <div className="p-4 space-y-4 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {supplier.email && (
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">{supplier.email}</span>
                        </div>
                    )}

                    {supplier.phoneNumber && (
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{supplier.phoneNumber}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {supplier.address && (
                        <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-600 line-clamp-2">{supplier.address}</span>
                        </div>
                    )}

                    {supplier.tin && (
                        <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">ΑΦΜ: {supplier.tin}</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(supplier)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(supplier)}
                            disabled={!supplier.isActive}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(supplier)}
                            disabled={!supplier.isActive}
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

export default SupplierCard;