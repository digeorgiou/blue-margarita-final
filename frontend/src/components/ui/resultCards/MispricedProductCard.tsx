import React, { useState } from "react";
import { Check, X } from 'lucide-react';
import type { MispricedProductAlertDTO } from "../../../types/api/dashboardInterface";

interface MispricedProductCardProps {
    product: MispricedProductAlertDTO;
    onUpdateRetailPrice: (product: MispricedProductAlertDTO, newPrice: number) => Promise<void>;
    onUpdateWholesalePrice: (product: MispricedProductAlertDTO, newPrice: number) => Promise<void>;
    updatingRetailPrice: boolean;
    updatingWholesalePrice: boolean;
    formatMoney: (amount: number) => string;
    getPricingIssueTypeLabel: (issueType: string) => string;
}

const MispricedProductCard: React.FC<MispricedProductCardProps> = ({
                                                                       product,
                                                                       onUpdateRetailPrice,
                                                                       onUpdateWholesalePrice,
                                                                       updatingRetailPrice,
                                                                       updatingWholesalePrice,
                                                                       formatMoney,
                                                                       getPricingIssueTypeLabel
                                                                   }) => {
    const [editingRetailPrice, setEditingRetailPrice] = useState(false);
    const [editingWholesalePrice, setEditingWholesalePrice] = useState(false);
    const [newRetailPrice, setNewRetailPrice] = useState(product.finalRetailPrice.toString());
    const [newWholesalePrice, setNewWholesalePrice] = useState(product.finalWholesalePrice.toString());

    const handleRetailPriceUpdate = async () => {
        const newPrice = Number(newRetailPrice);
        if (newPrice > 0 && newPrice !== product.finalRetailPrice) {
            await onUpdateRetailPrice(product, newPrice);
        }
        setEditingRetailPrice(false);
    };

    const handleWholesalePriceUpdate = async () => {
        const newPrice = Number(newWholesalePrice);
        if (newPrice > 0 && newPrice !== product.finalWholesalePrice) {
            await onUpdateWholesalePrice(product, newPrice);
        }
        setEditingWholesalePrice(false);
    };

    const handleCancelRetailEdit = () => {
        setNewRetailPrice(product.finalRetailPrice.toString());
        setEditingRetailPrice(false);
    };

    const handleCancelWholesaleEdit = () => {
        setNewWholesalePrice(product.finalWholesalePrice.toString());
        setEditingWholesalePrice(false);
    };

    const handleRetailKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRetailPriceUpdate();
        } else if (e.key === 'Escape') {
            handleCancelRetailEdit();
        }
    };

    const handleWholesaleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleWholesalePriceUpdate();
        } else if (e.key === 'Escape') {
            handleCancelWholesaleEdit();
        }
    };

    const getIssueColor = (issueType: string) => {
        switch (issueType) {
            case 'BOTH_UNDERPRICED':
                return 'bg-red-100 text-red-800';
            case 'RETAIL_UNDERPRICED':
                return 'bg-orange-100 text-orange-800';
            case 'WHOLESALE_UNDERPRICED':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifferenceColor = (percentage: number) => {
        if (percentage >= 50) return 'text-red-600';
        if (percentage >= 20) return 'text-orange-600';
        return 'text-yellow-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2">
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
                    <div className="text-right">
                        <div className={`font-bold text-lg ${getDifferenceColor(product.priceDifferencePercentage)} bg-white/20 px-2 py-1 rounded`}>
                            {product.priceDifferencePercentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
                {/* Issue Type Badge */}
                <div className="flex justify-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getIssueColor(product.issueType)}`}>
                        {getPricingIssueTypeLabel(product.issueType)}
                    </span>
                </div>

                {/* Retail Price Section */}
                {(product.issueType === 'RETAIL_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED') && (
                    <div className="space-y-2 border-b border-gray-200 pb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Λιανική Τιμή</h4>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Προτεινόμενη:</span>
                            <span className="text-lg font-bold text-green-600 pr-6">
                                {formatMoney(product.suggestedRetailPrice)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Τρέχουσα:</span>
                            {editingRetailPrice ? (
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                    <input
                                        type="number"
                                        value={newRetailPrice}
                                        onChange={(e) => setNewRetailPrice(e.target.value)}
                                        onKeyPress={handleRetailKeyPress}
                                        className="w-20 px-2 py-1 border border-blue-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        step="0.01"
                                        autoFocus
                                        disabled={updatingRetailPrice}
                                    />
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={handleRetailPriceUpdate}
                                            disabled={updatingRetailPrice || newRetailPrice === product.finalRetailPrice.toString()}
                                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                                            title="Αποθήκευση (Enter)"
                                        >
                                            {updatingRetailPrice ? (
                                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancelRetailEdit}
                                            disabled={updatingRetailPrice}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                            title="Ακύρωση (Escape)"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditingRetailPrice(true)}
                                    className="group flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    disabled={updatingRetailPrice}
                                    title="Κλικ για επεξεργασία"
                                >
                                    <span className="text-lg font-bold text-blue-600 group-hover:text-blue-800">
                                        {formatMoney(product.finalRetailPrice)}
                                    </span>
                                    <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Wholesale Price Section */}
                {(product.issueType === 'WHOLESALE_UNDERPRICED' || product.issueType === 'BOTH_UNDERPRICED') && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">Χονδρική Τιμή</h4>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Προτεινόμενη:</span>
                            <span className="font-medium text-green-600">
                                {formatMoney(product.suggestedWholesalePrice)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Τρέχουσα:</span>
                            {editingWholesalePrice ? (
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                    <input
                                        type="number"
                                        value={newWholesalePrice}
                                        onChange={(e) => setNewWholesalePrice(e.target.value)}
                                        onKeyPress={handleWholesaleKeyPress}
                                        className="w-20 px-2 py-1 border border-blue-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        step="0.01"
                                        autoFocus
                                        disabled={updatingWholesalePrice}
                                    />
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={handleWholesalePriceUpdate}
                                            disabled={updatingWholesalePrice || newWholesalePrice === product.finalWholesalePrice.toString()}
                                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                                            title="Αποθήκευση (Enter)"
                                        >
                                            {updatingWholesalePrice ? (
                                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancelWholesaleEdit}
                                            disabled={updatingWholesalePrice}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                            title="Ακύρωση (Escape)"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditingWholesalePrice(true)}
                                    className="group flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    disabled={updatingWholesalePrice}
                                    title="Κλικ για επεξεργασία"
                                >
                                    <span className="text-lg font-bold text-blue-600 group-hover:text-blue-800">
                                        {formatMoney(product.finalWholesalePrice)}
                                    </span>
                                    <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MispricedProductCard;