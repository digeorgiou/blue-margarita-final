import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import { MaterialSearchResultDTO } from '../../../types/api/materialInterface';

interface MaterialSearchDropdownProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: MaterialSearchResultDTO[];
    onSelectMaterial: (material: MaterialSearchResultDTO) => void;
    placeholder?: string;
    disabled?: boolean;
}

const MaterialSearchDropdown: React.FC<MaterialSearchDropdownProps> = ({
                                                                           searchTerm,
                                                                           onSearchChange,
                                                                           searchResults,
                                                                           onSelectMaterial,
                                                                           placeholder = "Αναζήτηση υλικών...",
                                                                           disabled = false
                                                                       }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Format money helper
    const formatMoney = (amount: number): string => {
        return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Open dropdown when typing
    useEffect(() => {
        if (searchTerm.length >= 2) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [searchTerm]);

    const handleSelectMaterial = (material: MaterialSearchResultDTO) => {
        onSelectMaterial(material);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${isOpen && searchResults.length > 0 ?
                        'rounded-b-none border-b-0' : ''}
                        border-gray-300 hover:border-gray-400
                    `}
                />

                {/* Clear search button */}
                {searchTerm && (
                    <button
                        onClick={() => {
                            onSearchChange('');
                            setIsOpen(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && searchResults.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((material) => (
                        <button
                            key={material.materialId}
                            onClick={() => handleSelectMaterial(material)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-center">
                                <Package className="w-4 h-4 text-gray-400 mr-3" />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                        {material.materialName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatMoney(material.currentUnitCost)}/{material.unitOfMeasure}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && searchTerm.length >= 2 && searchResults.length === 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg p-4 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No materials found</p>
                    <p className="text-xs">Try a different search term</p>
                </div>
            )}

            {/* Search instruction */}
            {searchTerm.length > 0 && searchTerm.length < 2 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg p-4 text-center text-gray-500">
                    <p className="text-sm">Type at least 2 characters to search</p>
                </div>
            )}
        </div>
    );
};

export default MaterialSearchDropdown;