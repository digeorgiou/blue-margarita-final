import { useState, useCallback } from 'react';

interface UsePaginationProps {
    initialPage?: number;
    initialPageSize?: number;
    onPageChange?: (page: number, pageSize: number) => void;
}

interface UsePaginationReturn {
    currentPage: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    resetPagination: () => void;
    getPaginationParams: () => { page: number; pageSize: number };
}

export const usePagination = ({
                                  initialPage = 0,
                                  initialPageSize = 12,
                                  onPageChange
                              }: UsePaginationProps = {}): UsePaginationReturn => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
        onPageChange?.(page, pageSize);
    }, [pageSize, onPageChange]);

    const setPageSizeAndResetPage = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(0);
        onPageChange?.(0, size);
    }, [onPageChange]);

    const resetPagination = useCallback(() => {
        setCurrentPage(initialPage);
        setPageSize(initialPageSize);
        onPageChange?.(initialPage, initialPageSize);
    }, [initialPage, initialPageSize, onPageChange]);

    const getPaginationParams = useCallback(() => ({
        page: currentPage,
        pageSize: pageSize
    }), [currentPage, pageSize]);

    return {
        currentPage,
        pageSize,
        setPage,
        setPageSize: setPageSizeAndResetPage,
        resetPagination,
        getPaginationParams
    };
};