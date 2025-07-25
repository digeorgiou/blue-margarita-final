import React from 'react';
import { Button } from './';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
                                                                   currentPage,
                                                                   totalPages,
                                                                   totalElements,
                                                                   pageSize, // Now accepts pageSize
                                                                   hasNext,
                                                                   hasPrevious,
                                                                   onPageChange
                                                               }) => {
    // Calculate range of items shown on current page
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
                Σελίδα {currentPage + 1} από {totalPages}
                <span className="text-gray-500 ml-2">
                    (Δείχνοντας {startItem}-{endItem} από {totalElements} αποτελέσματα)
                </span>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrevious}
                    variant="outline-secondary"
                    size="sm"
                >
                    ← Προηγούμενη
                </Button>
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext}
                    variant="outline-secondary"
                    size="sm"
                >
                    Επόμενη →
                </Button>
            </div>
        </div>
    );
};

export default PaginationControls;