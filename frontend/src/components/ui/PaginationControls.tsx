import React from 'react';
import { Button } from './';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
                                                                          currentPage,
                                                                          totalPages,
                                                                          totalElements,
                                                                          hasNext,
                                                                          hasPrevious,
                                                                          onPageChange
                                                                      }) => (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages} ({totalElements} total)
        </div>
        <div className="flex gap-2">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevious}
                variant="outline-secondary"
                size="sm"
            >
                ← Previous
            </Button>
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext}
                variant="outline-secondary"
                size="sm"
            >
                Next →
            </Button>
        </div>
    </div>
);

export default PaginationControls;