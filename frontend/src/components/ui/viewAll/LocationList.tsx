import { LocationDropdownListProps } from "../../../types/components/dropdown-types.ts";
import { LoadingSpinner, Button } from '../common';
import {Package, Eye, Trash2, Edit, Gem, RotateCcw} from 'lucide-react';
import React from "react";

const LocationList: React.FC<LocationDropdownListProps> = ({
                                                                           locations,
                                                                           loading,
                                                                           onEdit,
                                                                           onDelete,
                                                                           onViewDetails,
                                                                           onRestore,
                                                                           showSoftDeleted = false
                                                                       }) => {
    if (loading) {
        return (
            <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-500 mt-3 text-sm">Φόρτωση τοποθεσιών...</p>
            </div>
        );
    }

    if (locations.length === 0) {
        const message = showSoftDeleted
            ? "Δεν υπάρχουν διαγραμμένες τοποθεσίες"
            : "";
        const subMessage = showSoftDeleted
            ? "Όλες οι τοποθεσίες είναι ενεργές"
            : "Δημιουργήστε την πρώτη σας κατηγορία για να ξεκινήσετε";
        return (
            <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
                <p className="text-sm text-gray-500 mb-4">{subMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="divide-y divide-gray-200">
                {locations.map((location) => (
                    <div
                        key={location.id}
                        className="p-6 hover:bg-green-100 transition-colors duration-150 rounded-lg"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        showSoftDeleted ? 'bg-red-100' : 'bg-blue-100'
                                    }`}>
                                        <Gem className={`w-5 h-5 ${
                                            showSoftDeleted ? 'text-red-600' : 'text-blue-600'
                                        }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {location.name}
                                            </h3>
                                            {showSoftDeleted && (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                    Διαγραμμένη
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">ID: {location.id}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                                <div className="lg:w-auto">
                                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
                                        <Button
                                            size="sm"
                                            variant="info"
                                            onClick={() => onViewDetails(location)}
                                            title="Προβολή Λεπτομερειών"
                                            className="w-full lg:w-auto flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Λεπτομέρειες
                                        </Button>

                                        {/* Restore Button - only for soft deleted categories */}
                                        {showSoftDeleted && onRestore && (
                                            <Button
                                                size="sm"
                                                variant="orange"
                                                onClick={() => onRestore(location)}
                                                title="Επαναφορά"
                                                className="w-full lg:w-auto flex items-center justify-center gap-2"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Επαναφορά
                                            </Button>
                                        )}

                                        {/* Edit Button - only for active categories */}
                                        {!showSoftDeleted && onEdit && (
                                            <Button
                                                size="sm"
                                                variant="teal"
                                                onClick={() => onEdit(location)}
                                                title="Επεξεργασία"
                                                className="w-full lg:w-auto flex items-center justify-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Επεξεργασία
                                            </Button>
                                        )}

                                        {/* Delete Button - only for active categories */}
                                        {!showSoftDeleted && onDelete && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => onDelete(location)}
                                                title="Διαγραφή"
                                                className="w-full lg:w-auto flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Διαγραφή
                                            </Button>
                                        )}

                                    </div>
                                </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LocationList;