import React from 'react';
import { LoadingSpinner } from '../ui';

interface ManagementListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    loading: boolean;
    emptyMessage: string;
    emptyIcon: string;
}

function ManagementList<T>({
                               items,
                               renderItem,
                               loading,
                               emptyMessage,
                               emptyIcon
                           }: ManagementListProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">{emptyIcon}</div>
                <p className="text-gray-500 text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    {renderItem(item)}
                </div>
            ))}
        </div>
    );
}

export default ManagementList;