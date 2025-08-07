import {useState} from "react";
import { Check, X } from 'lucide-react';

interface StockProductCardProps {
    product: StockManagementDTO;
    onUpdateStock: (product: StockManagementDTO, newStock: number) => Promise<void>;
    updating: boolean;
    onUpdateStockLimit: (product: StockManagementDTO, newStock: number) => Promise<void>;
    updatingLimit: boolean;
    getStatusColor: (status: StockStatus) => string;
}

const StockProductCard: React.FC<StockProductCardProps> = ({
                                                               product,
                                                               onUpdateStock,
                                                               updating,
                                                               getStatusColor,
                                                               onUpdateStockLimit,
                                                               updatingLimit,
                                                           }) => {
    const [editingStock, setEditingStock] = useState(false);
    const [editingStockLimit, setEditingStockLimit] = useState(false);
    const [newStockValue, setNewStockValue] = useState(product.currentStock.toString());
    const [newLimitValue, setNewLimitValue] = useState(product.lowStockAlert);

    const handleStockUpdate = async () => {
        const newStock = Number(newStockValue);
        if (newStock >= 0 && newStock !== product.currentStock) {
            await onUpdateStock(product, newStock);
        }
        setEditingStock(false);
    };

    const handleStockLimitUpdate = async () => {
        const newLimit = Number(newLimitValue);
        if (newLimit >= 0 && newLimit !== product.lowStockAlert) {
            await onUpdateStockLimit(product, newLimit);
        }
        setEditingStockLimit(false);
    }

    const handleCancelEdit = () => {
        setNewStockValue(product.currentStock.toString());
        setEditingStock(false);
    };

    const handleCancelLimitEdit = () => {
        setNewLimitValue(product.lowStockAlert.toString());
        setEditingStockLimit(false);
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleStockUpdate();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2" >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {product.productName}
                        </h3>
                        <p className="text-purple-100 text-sm font-mono">
                            {product.productCode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Category */}
                <div>
                    <p className="text-sm text-gray-600">{product.categoryName}</p>
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Κατάσταση:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                        {product.status === 'NORMAL' && 'Κανονικό'}
                        {product.status === 'LOW' && 'Χαμηλό'}
                        {product.status === 'NEGATIVE' && 'Αρνητικό'}
                        {product.status === 'NO_ALERT' && 'Χωρίς Ειδοποίηση'}
                    </span>
                </div>

                {/* Current Stock with Inline Editing */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Τρέχον Απόθεμα:</span>
                        {editingStock ? (
                            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                <input
                                    type="number"
                                    value={newStockValue}
                                    onChange={(e) => setNewStockValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-16 px-2 py-1 border border-blue-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="0"
                                    autoFocus
                                    disabled={updating}
                                />
                                <div className="flex space-x-2 sm:space-x-1 w-full sm:w-auto">
                                    <button
                                        onClick={handleStockUpdate}
                                        disabled={updating || newStockValue === product.currentStock.toString()}
                                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                                        title="Αποθήκευση (Enter)"
                                    >
                                        {updating ? (
                                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={updating}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                        title="Ακύρωση (Escape)"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditingStock(true)}
                                className="group flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                disabled={updating}
                                title="Κλικ για επεξεργασία"
                            >
                                <span className="text-lg font-bold text-blue-600 group-hover:text-blue-800">
                                    {product.currentStock}
                                </span>
                                <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Low Stock Threshold */}
                    {product.lowStockAlert && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Όριο Ειδοποίησης:</span>
                            {editingStockLimit ? (
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                    <input
                                        type="number"
                                        value={newLimitValue}
                                        onChange={(e) => setNewLimitValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-16 px-2 py-1 border border-blue-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        autoFocus
                                        disabled={updatingLimit}
                                    />
                                    <div className="flex space-x-2 sm:space-x-1 w-full sm:w-auto">
                                        <button
                                            onClick={handleStockLimitUpdate}
                                            disabled={updatingLimit || newLimitValue === product.lowStockAlert.toString()}
                                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                                            title="Αποθήκευση (Enter)"
                                        >
                                            {updatingLimit ? (
                                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancelLimitEdit}
                                            disabled={updatingLimit}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                            title="Ακύρωση (Escape)"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditingStockLimit(true)}
                                    className="group flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    disabled={updatingLimit}
                                    title="Κλικ για επεξεργασία"
                                >
                                <span className="text-lg font-bold text-blue-600 group-hover:text-blue-800">
                                    {product.lowStockAlert}
                                </span>
                                    <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stock Value */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Αξία Αποθέματος:</span>
                    <span className="text-sm font-bold text-green-600">
                        €{product.totalStockValue.toFixed(2)}
                    </span>
                </div>

                {/* Unit Price */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Τιμή Λιανικής Μονάδας:</span>
                    <span className="text-xs text-gray-700">
                        €{product.unitSellingPrice.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StockProductCard;