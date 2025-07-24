import React from 'react';
import { Button } from './';

interface FilterContainerProps {
    title: string;
    children: React.ReactNode;
    onClearFilters: () => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

const FilterContainer: React.FC<FilterContainerProps> = ({
                                                                    title,
                                                                    children,
                                                                    onClearFilters,
                                                                    onRefresh,
                                                                    isLoading = false
                                                                }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        {children}
        <div className="flex gap-2 mt-4">
            <Button onClick={onClearFilters} variant="secondary" size="sm">
                Καθαρισμός Φίλτρων
            </Button>
            <Button onClick={onRefresh} variant="outline-secondary" size="sm" disabled={isLoading}>
                🔄 Ανανέωση
            </Button>
        </div>
    </div>
);

export default FilterContainer;