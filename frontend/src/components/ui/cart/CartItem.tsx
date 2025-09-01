// Replace your CartItem.tsx with this - it just fixes the problematic horizontal price line
import React, { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItemDTO } from '../../../types/api/recordSaleInterface.ts';

interface CartItemProps {
    item: CartItemDTO;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
    formatMoney: (amount: number) => string;
}

const CartItem: React.FC<CartItemProps> = ({
                                               item,
                                               onUpdateQuantity,
                                               onRemove,
                                               formatMoney
                                           }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityChange = async (newQuantity: number) => {
        if (newQuantity < 0) return;
        setIsUpdating(true);
        try {
            await onUpdateQuantity(newQuantity);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            {/* Product Info */}
            <div className="flex items-center flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Κωδικός: {item.productCode}
                    </p>
                    <div className="mt-1">
                        <div className="text-xs text-gray-600">
                            Τιμή/τμχ: {formatMoney(item.suggestedPrice)}
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                            Σύνολο: {formatMoney(item.totalPrice)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center">
                <div className="flex flex-col items-center justify-center space-y-0">
                    <button
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        disabled={isUpdating}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>

                    <div className="w-8 text-center text-sm font-medium py-1">
                        {item.quantity}
                    </div>

                    <button
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                </div>

                 {/*Remove Button */}
                <button
                    onClick={onRemove}
                    disabled={isUpdating}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Remove from cart"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Loading indicator */}
            {isUpdating && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default CartItem;