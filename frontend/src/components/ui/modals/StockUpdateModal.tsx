import React, { useState, useEffect } from 'react';
import { Button, Input } from '../';
import { stockManagementService } from '../../../services/stockManagementService';
import type { StockAlertDTO } from '../../../types/api/dashboardInterface';
import type { StockUpdateDTO } from '../../../types/api/stockManagementInterface';

interface StockUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: StockAlertDTO | null;
    onStockUpdated: () => void;
}

export const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      product,
                                                                      onStockUpdated
                                                                  }) => {
    const [newStockAmount, setNewStockAmount] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && product) {
            setNewStockAmount('');
        }
    }, [isOpen, product]);

    const handleStockUpdate = async () => {
        if (!product || !newStockAmount) return;

        try {
            setUpdateLoading(true);

            const stockUpdateData: StockUpdateDTO = {
                productId: product.productId,
                updateType: 'SET',
                quantity: parseInt(newStockAmount),
                updaterUserId: 1 // You might want to get this from auth context
            };

            await stockManagementService.updateProductStock(stockUpdateData);

            // Close modal and refresh data
            onClose();
            onStockUpdated();

        } catch (error) {
            console.error('Failed to update stock:', error);
            alert('Failed to update stock. Please try again.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleClose = () => {
        if (!updateLoading) {
            setNewStockAmount('');
            onClose();
        }
    };

    // Don't render if not open or no product
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            disabled={updateLoading}
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Product Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                            <p className="text-sm text-gray-600">Code: {product.productCode}</p>
                            <p className="text-sm text-gray-600">
                                Current Stock:
                                <span className={`font-semibold ml-1 ${
                                    product.currentStock <= 5 ? 'text-red-600' :
                                        product.currentStock <= 10 ? 'text-orange-600' :
                                            'text-gray-900'
                                }`}>
                  {product.currentStock}
                </span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Low Stock Threshold: <span className="font-semibold">{product.lowStockThreshold}</span>
                            </p>
                        </div>

                        {/* New Stock Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Stock Amount *
                            </label>
                            <Input
                                type="number"
                                value={newStockAmount}
                                onChange={(e) => setNewStockAmount(e.target.value)}
                                placeholder="Enter new stock amount..."
                                disabled={updateLoading}
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This will set the stock to the exact amount you enter
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleClose}
                                variant="secondary"
                                disabled={updateLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStockUpdate}
                                variant="primary"
                                disabled={updateLoading || !newStockAmount || parseInt(newStockAmount) < 0}
                                className="flex-1"
                            >
                                {updateLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Stock'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};