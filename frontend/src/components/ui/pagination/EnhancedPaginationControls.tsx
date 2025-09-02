import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageSizeSelector } from '.';
import { EnhancedPaginationControlsProps } from "../../../types/components/pagination-types.ts";

const EnhancedPaginationControls: React.FC<EnhancedPaginationControlsProps> = ({
                                                                                   paginationData,
                                                                                   setCurrentPage,
                                                                                   setPageSize,
                                                                                   className = ""
                                                                               }) => {
    const { currentPage, totalPages, totalElements, pageSize } = paginationData;

    // Internal handlers that implement the common logic
    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(0); // Reset to first page when page size changes
    };

    const generatePageNumbers = () => {
        const delta = 2; // Number of pages to show around current page
        const range = [];
        const start = Math.max(0, currentPage - delta);
        const end = Math.min(totalPages - 1, currentPage + delta);

        // Always show first page
        if (start > 0) {
            range.push(0);
            if (start > 1) {
                range.push(-1); // Represents "..."
            }
        }

        // Show pages around current page
        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        // Always show last page
        if (end < totalPages - 1) {
            if (end < totalPages - 2) {
                range.push(-1); // Represents "..."
            }
            range.push(totalPages - 1);
        }

        return range;
    };

    const pageNumbers = generatePageNumbers();

    if (totalElements === 0) {
        return (
            <div className={`flex justify-between items-center ${className}`}>
                <div className="text-sm text-gray-500">
                    Δεν βρέθηκαν αποτελέσματα
                </div>
                <PageSizeSelector
                    currentPageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        );
    }

    const startResult = currentPage * pageSize + 1;
    const endResult = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className={`flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 ${className}`}>
            {/* Results info */}
            <div className="text-sm text-gray-700">
                Εμφάνιση {startResult}-{endResult} από {totalElements} αποτελέσματα
            </div>

            {/* Page navigation */}
            <div className="flex items-center space-x-2">
                {/* First page button */}
                <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Πρώτη σελίδα"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous page button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Προηγούμενη"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((pageNum, index) => {
                        if (pageNum === -1) {
                            return (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                    pageNum === currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Next page button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Επόμενη"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page button */}
                <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Τελευταία σελίδα"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>

            {/* Page size selector */}
            <PageSizeSelector
                currentPageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
};

export default EnhancedPaginationControls;