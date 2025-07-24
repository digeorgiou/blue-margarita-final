import { useState } from 'react';

export function usePagination(initialPage = 0) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const nextPage = () => setCurrentPage(prev => prev + 1);
    const prevPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
    const resetPage = () => setCurrentPage(0);
    const goToPage = (page: number) => setCurrentPage(Math.max(0, page));

    return {
        currentPage,
        setCurrentPage,
        nextPage,
        prevPage,
        resetPage,
        goToPage
    };
}