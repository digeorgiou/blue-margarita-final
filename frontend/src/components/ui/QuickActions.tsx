import React from 'react';
import ActionButton from './ActionButton';
import {QuickActionsProps} from "../../types/components/quickAction.ts";

const QuickActions: React.FC<QuickActionsProps> = ({
                                                       onRecordSale,
                                                       onRecordPurchase,
                                                       onStockManagement
                                                   }) => {
    return (
        <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                        <p className="text-gray-600 mt-1">Frequently used operations</p>
                    </div>
                    <div className="text-3xl">⚡</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionButton
                        title="Record Sale"
                        description="Add a new sale transaction"
                        icon="🛍️"
                        color="green"
                        onClick={onRecordSale}
                    />

                    <ActionButton
                        title="Record Purchase"
                        description="Add a new purchase from supplier"
                        icon="📦"
                        color="blue"
                        onClick={onRecordPurchase}
                    />

                    <ActionButton
                        title="Stock Management"
                        description="Manage inventory and stock levels"
                        icon="📊"
                        color="purple"
                        onClick={onStockManagement}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuickActions;