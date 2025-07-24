import { useState } from 'react';

export function useSorting(initialSortBy = 'id', initialDirection: 'ASC' | 'DESC' = 'ASC') {
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>(initialDirection);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
    };

    return {
        sortBy,
        sortDirection,
        handleSort,
        setSortBy,
        setSortDirection
    };
}