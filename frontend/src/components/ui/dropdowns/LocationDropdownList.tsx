import { LocationDropdownListProps } from "../../../types/components/dropdown-types.ts";
import { LoadingSpinner, Button } from "../index.ts";
import {Package, Eye, Trash2, Edit, MapPin} from 'lucide-react';


const LocationDropdownList: React.FC<LocationDropdownListProps> = ({
                                                                           locations,
                                                                           loading,
                                                                           onEdit,
                                                                           onDelete,
                                                                           onViewDetails
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
        return (
            <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν υπάρχουν τοποθεσίες</h3>
                <p className="text-sm text-gray-500 mb-4">Δημιουργήστε την πρώτη σας τοποθεσία για να ξεκινήσετε</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {locations.map((location) => (
                <div
                    key={location.id}
                    className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                    {location.name}
                                </h3>
                                <p className="text-sm text-gray-500">ID: {location.id}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 transition-opacity">
                            <Button
                                size="sm"
                                variant="info"
                                onClick={() => onViewDetails(location)}
                                title="Προβολή Λεπτομερειών"
                                className="hover:bg-blue-50"
                            >
                                <Eye className="w-4 h-4" />
                                Λεπτομέρειες
                            </Button>
                            <Button
                                size="sm"
                                variant="teal"
                                onClick={() => onEdit(location)}
                                title="Επεξεργασία"
                                className="hover:bg-green-50 hover:text-green-600"
                            >
                                <Edit className="w-4 h-4" />
                                Επεξεργασία
                            </Button>
                            <Button
                                size="sm"
                                variant={"danger"}
                                onClick={() => onDelete(location)}
                                title="Διαγραφή"
                                className="hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Διαγραφή
                            </Button>
                        </div>
                    </div>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-200 rounded-lg pointer-events-none transition-colors" />
                </div>
            ))}
        </div>
    );
};

export default LocationDropdownList;