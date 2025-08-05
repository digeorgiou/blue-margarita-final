import React from 'react';
import Button from './Button.tsx';
import { HandCoins, Package, BarChart3 } from 'lucide-react';
import {QuickActionsProps} from "../../../types/components/quickAction.ts";

const QuickActions: React.FC<QuickActionsProps> = ({
                                                       onRecordSale,
                                                       onRecordPurchase,
                                                       onStockManagement
                                                   }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Button
                variant="success"
                size="xl"
                onClick={onRecordSale}
                className="h-48 flex-col space-y-2 text-center justify-center"
            >
                <HandCoins className="w-24 h-24 mx-auto" />
                <div>
                    <div className="font-bold text-2xl mb-2">Νέα Πώληση</div>
                    <div className="text-sm opacity-90">Καταγράψτε μια καινούρια πώληση</div>
                </div>
            </Button>

            <Button
                variant="info"
                size="xl"
                onClick={onRecordPurchase}
                className="h-48 flex-col space-y-2 text-center justify-center"
            >
                <Package className="w-24 h-24 mx-auto" />
                <div>
                    <div className="font-bold text-2xl mb-2">Νέα Αγορά</div>
                    <div className="text-sm opacity-90">Καταγράψτε μια καινούρια αγορά</div>
                </div>
            </Button>

            <Button
                variant="purple"
                size="xl"
                onClick={onStockManagement}
                className="h-48 flex-col space-y-2 text-center justify-center"
            >
                <BarChart3 className="w-24 h-24 mx-auto" />
                <div>
                    <div className="font-bold text-2xl mb-2">Αποθήκη</div>
                    <div className="text-sm opacity-90">Διαχείριση των αποθεμάτων των προϊόντων</div>
                </div>
            </Button>
        </div>
    );
};

export default QuickActions;