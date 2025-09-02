export type PaginationData = {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    numberOfElements: number;
}

export type EnhancedPaginationControlsProps = {
    paginationData: PaginationData;
    setCurrentPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    className?: string;
}

export type PageSizeSelectorProps = {
    currentPageSize: number;
    onPageSizeChange: (newPageSize: number) => void;
    className?: string;
}