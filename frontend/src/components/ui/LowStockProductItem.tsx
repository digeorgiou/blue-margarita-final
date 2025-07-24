import React from 'react';
import { Button } from './';
import type { StockAlertDTO } from '../../types/api/dashboardInterface';

interface LowStockProductItemProps {
    product: StockAlertDTO;
    onUpdateStock: (product: StockAlertDTO) => void;
}

const LowStockProductItem: React.FC<LowStockProductItemProps> = ({
                                                                            product,
                                                                            onUpdateStock
                                                                        }) => {
    // Helper function to get stock color based on level
    const getStockColor = (currentStock: number, threshold: number) => {
        if (currentStock === 0) return 'text-red-700';
        if (currentStock <= threshold * 0.5) return 'text-red-600';
        if (currentStock <= threshold) return 'text-orange-600';
        return 'text-green-600';
    };

    const stockColor = getStockColor(product.currentStock, product.lowStockThreshold);

    return (
        <div className="p-4 rounded-lg border-l-4 border-red-400 bg-red-50 hover:bg-red-100 transition-colors">
            {/* Mobile Layout */}
            <div className="md:hidden">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                        <p className="text-sm text-gray-600">Code: {product.productCode}</p>
                    </div>
                    <div className="text-right">
            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase">
              {product.stockStatus}
            </span>
                    </div>
                </div>

                <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-600">
            Stock: <span className={`font-semibold ${stockColor}`}>{product.currentStock}</span>
          </span>
                    <span className="text-gray-600">
            Threshold: <span className="font-semibold">{product.lowStockThreshold}</span>
          </span>
                </div>

                {/* Mobile Action Button */}
                <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onUpdateStock(product)}
                    className="w-full"
                >
                    Update Stock
                </Button>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
                <div>
                    <p className="text-gray-700 font-mono">{product.productCode}</p>
                </div>

                <div>
          <span className={`font-bold text-lg ${stockColor}`}>
            {product.currentStock}
          </span>
                    {product.currentStock === 0 && (
                        <span className="block text-xs text-red-600 font-semibold">OUT OF STOCK</span>
                    )}
                </div>

                <div>
                    <span className="text-gray-700 font-semibold">{product.lowStockThreshold}</span>
                </div>

                <div className="flex gap-2 items-center">
          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase">
            {product.stockStatus}
          </span>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onUpdateStock(product)}
                    >
                        Update Stock
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LowStockProductItem;