import React from 'react';
import { Eye, Edit, Trash2, Package, Ruler, AlertTriangle } from 'lucide-react';
import { IoHammerOutline } from 'react-icons/io5';
import { Button } from '../';
import type { MaterialReadOnlyDTO } from '../../../types/api/materialInterface';

interface MaterialCardProps {
    material: MaterialReadOnlyDTO;
    onViewDetails: (material: MaterialReadOnlyDTO) => void;
    onEdit: (material: MaterialReadOnlyDTO) => void;
    onDelete: (material: MaterialReadOnlyDTO) => void;
    onViewProducts: (material: MaterialReadOnlyDTO) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
                                                       material,
                                                       onViewDetails,
                                                       onEdit,
                                                       onDelete,
                                                       onViewProducts
                                                   }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('el-GR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {material.name}
                        </h3>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <IoHammerOutline className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Cost Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-700">
                            Κόστος Μονάδας: {formatCurrency(material.currentUnitCost)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-gray-200">
                        <Ruler className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="text-lg font-bold text-gray-700">Μονάδα Μέτρησης: {material.unitOfMeasure}</span>
                    </div>
                </div>

                {/* Deleted Status Warning */}
                {material.deletedAt && (
                    <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">
                                Διαγραμμένο: {formatDate(material.deletedAt.toString())}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(material)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="orange"
                            size="sm"
                            onClick={() => onViewProducts(material)}
                            title="Δείτε όλα τα προϊόντα που χρησιμοποιούν αυτό το υλικό"
                        >
                            <Package className="w-4 h-4" />
                            <span>Προϊόντα</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(material)}
                            disabled={!material.isActive}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(material)}
                            disabled={!material.isActive}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Διαγραφή</span>
                        </Button>
                    </div>
                </div>

                {/* Status Note */}
                {!material.isActive && (
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 italic">
                            Τα ανενεργά υλικά δεν μπορούν να επεξεργαστούν ή διαγραφούν
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialCard;