import React from 'react';
import { Eye, Edit, Trash2, Package, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '../../common';
import type { ProcedureCardProps } from "../../../types/components/resultCard-types.ts";
import { formatDateTime, formatDate } from "../../../utils/formatters.ts";

const ProcedureCard: React.FC<ProcedureCardProps> = ({
                                                         procedure,
                                                         onViewDetails,
                                                         onEdit,
                                                         onDelete,
                                                         onViewProducts
                                                     }) => {

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {procedure.name}
                        </h3>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Deleted Status Warning */}
                {procedure.deletedAt && (
                    <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">
                                Διαγραμμένη: {formatDateTime(procedure.deletedAt)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetails(procedure)}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Λεπτομέρειες</span>
                        </Button>

                        <Button
                            variant="orange"
                            size="sm"
                            onClick={() => onViewProducts(procedure)}
                            title="Δείτε όλα τα προϊόντα που χρησιμοποιούν αυτή τη διαδικασία"
                        >
                            <Package className="w-4 h-4" />
                            <span>Προϊόντα</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="teal"
                            size="sm"
                            onClick={() => onEdit(procedure)}
                            disabled={!procedure.isActive}
                        >
                            <Edit className="w-4 h-4" />
                            <span>Επεξεργασία</span>
                        </Button>

                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(procedure)}
                            disabled={!procedure.isActive}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Διαγραφή</span>
                        </Button>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center justify-between">
                            <span>Ημ/νία δημιουργίας:</span>
                            <span>{formatDate(procedure.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcedureCard;