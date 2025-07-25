import React from 'react';
import { LoadingSpinner } from '../ui';

interface ManagementListProps<T> {
    items?: T[]; // Made optional to handle undefined case
    renderItem: (item: T) => React.ReactNode;
    loading: boolean;
    emptyMessage: string;
    emptyIcon: string;
}

function ManagementList<T>({
                               items = [], // Default to empty array
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

    // Safety check for undefined or null items
    if (!items || items.length === 0) {
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
                <div key={index}>
                    {renderItem(item)}
                </div>
            ))}
        </div>
    );
}

export default ManagementList;