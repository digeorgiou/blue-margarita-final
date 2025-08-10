import React from 'react';
import { Eye, Edit, Trash2, ShoppingCart, Truck, Package, Calendar, User } from 'lucide-react';
import { Button } from '../';
import type { PurchaseReadOnlyDTO } from '../../../types/api/purchaseInterface';

interface PurchaseCardProps {
    purchase: PurchaseReadOnlyDTO;
    onViewDetails: (purchase: PurchaseReadOnlyDTO) => void;
    onEdit: (purchase: PurchaseReadOnlyDTO) => void;
    onDelete: (purchase: PurchaseReadOnlyDTO) => void;
}

const PurchaseCard: React.FC<PurchaseCardProps> = ({
                                                       purchase,
                                                       onViewDetails,
                                                       onEdit,
                                                       onDelete
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const generatePurchaseTitle = () => {
        if (!purchase.materials || purchase.materials.length === 0) {
            return `Αγορά #${purchase.id}`;
        }

        // If only one material, show material name and quantity
        if (purchase.materials.length === 1) {
            const material = purchase.materials[0];
            return `${material.materialName} (${material.quantity} ${material.unitOfMeasure})`;
        }

        // If multiple materials, show first material and count
        const firstMaterial = purchase.materials[0];
        const remainingCount = purchase.materials.length - 1;

        if (remainingCount === 1) {
            return `${firstMaterial.materialName} + 1 ακόμα`;
        } else {
            return `${firstMaterial.materialName} + ${remainingCount} ακόμα`;
        }
    };

    const getMaterialsSummary = () => {
        if (!purchase.materials || purchase.materials.length === 0) {
            return 'Χωρίς υλικά';
        }

        const totalQuantity = purchase.materials.reduce((sum, material) => {
            return sum + material.quantity;
        }, 0);

        return `${purchase.materials.length} ${purchase.materials.length === 1 ? 'υλικό' : 'υλικά'} (${totalQuantity.toFixed(2)} συνολικές μονάδες)`;
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {generatePurchaseTitle()}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {formatDate(purchase.purchaseDate)}
                            </span>
                        </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <ShoppingCart className="w-6 h-6 text-white/80" />
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Supplier Information */}
                <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                        <span className="font-medium">Προμηθευτής:</span> {purchase.supplierName}
                    </span>
                </div>

                {/* Cost Information */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Συνολικό Κόστος:</span>
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(purchase.totalCost)}
                        </span>
                    </div>
                </div>

                {/* Materials Breakdown */}
                {purchase.materials && purchase.materials.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Υλικά αγοράς:</span>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                            {purchase.materials.slice(0, 3).map((material, index) => (
                                <div key={index} className="flex justify-between items-center text-xs text-gray-600">
                                    <span className="truncate flex-1">
                                        {material.materialName}
                                    </span>
                                    <span className="ml-2 flex-shrink-0">
                                        {material.quantity} {material.unitOfMeasure}
                                    </span>
                                    <span className="ml-2 flex-shrink-0 font-medium">
                                        {formatCurrency(material.lineTotal)}
                                    </span>
                                </div>
                            ))}
                            {purchase.materials.length > 3 && (
                                <div className="text-xs text-gray-500 italic">
                                    ... και {purchase.materials.length - 3} ακόμα
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(purchase)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(purchase)}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(purchase)}
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

export default PurchaseCard;