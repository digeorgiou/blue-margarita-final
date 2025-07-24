import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import { ProductSearchResultDTO } from '../../../types/api/recordSaleInterface';

interface ProductSearchDropdownProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: ProductSearchResultDTO[];
    onSelectProduct: (product: ProductSearchResultDTO) => void;
    placeholder?: string;
    disabled?: boolean;
}

const ProductSearchDropdown: React.FC<ProductSearchDropdownProps> = ({
                                                                         searchTerm,
                                                                         onSearchChange,
                                                                         searchResults,
                                                                         onSelectProduct,
                                                                         placeholder = "Search for products to add",
                                                                         disabled = false
                                                                     }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onSearchChange(value);
        setIsOpen(value.length >= 2);
    };

    const handleSelectProduct = (product: ProductSearchResultDTO) => {
        onSelectProduct(product);
        setIsOpen(false);
        // Clear the search after selection
        onSearchChange('');
        inputRef.current?.blur();
    };

    const handleInputFocus = () => {
        if (searchTerm.length >= 2) {
            setIsOpen(true);
        }
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full pl-10 pr-4 py-2 border rounded-lg text-sm
                        transition-colors duration-200
                        placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                        ${isOpen ? 'rounded-b-none border-b-0' : ''}
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
                    {searchResults.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-center">
                                <Package className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {product.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Κωδικός: {product.code}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Κατηγορία: {product.categoryName}
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
                    <p className="text-sm">No products found</p>
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

export default ProductSearchDropdown;