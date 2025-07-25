import { PaymentMethodDTO } from "../../../../types/api/recordSaleInterface.ts";
import { Package, Eye, Trash2, Edit } from 'lucide-react';
import { Button, LoadingSpinner} from "../../index.ts";


interface PaymentMethodManagementListProps {
    paymentMethods: PaymentMethodDTO[];
    loading: boolean;
    onEdit: (method: PaymentMethodDTO) => void;
    onDelete: (method: PaymentMethodDTO) => void;
    onViewDetails: (method: PaymentMethodDTO) => void;
}

const PaymentMethodManagementList: React.FC<PaymentMethodManagementListProps> = ({
                                                                                     paymentMethods,
                                                                                     loading,
                                                                                     onEdit,
                                                                                     onDelete,
                                                                                     onViewDetails
                                                                                 }) => {
    if (loading) {
        return (
            <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-500 mt-3 text-sm">Φόρτωση μεθόδων πληρωμής...</p>
            </div>
        );
    }

    if (paymentMethods.length === 0) {
        return (
            <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν υπάρχουν μέθοδοι πληρωμής</h3>
                <p className="text-sm text-gray-500 mb-4">Δημιουργήστε την πρώτη σας μέθοδο πληρωμής</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {paymentMethods.map((method) => (
                <div
                    key={method.value}
                    className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                    {method.displayName}
                                </h3>
                                <p className="text-sm text-gray-500">Value: {method.value}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="ghost-primary"
                                onClick={() => onViewDetails(method)}
                                title="Προβολή Λεπτομερειών"
                                className="hover:bg-blue-50"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost-primary"
                                onClick={() => onEdit(method)}
                                title="Επεξεργασία"
                                className="hover:bg-green-50 hover:text-green-600"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={"danger"}
                                onClick={() => onDelete(method)}
                                title="Διαγραφή"
                                className="hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-200 rounded-lg pointer-events-none transition-colors" />
                </div>
            ))}
        </div>
    );
};

export default PaymentMethodManagementList;