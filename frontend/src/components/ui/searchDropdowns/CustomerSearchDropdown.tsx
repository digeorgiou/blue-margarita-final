import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { CustomerSearchResultDTO } from '../../../types/api/customerInterface';

interface CustomerSearchDropdownProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: CustomerSearchResultDTO[];
    selectedCustomer: CustomerSearchResultDTO | null;
    onSelectCustomer: (customer: CustomerSearchResultDTO) => void;
    onClearSelection?: () => void;
    placeholder?: string;
    disabled?: boolean;
}

const CustomerSearchDropdown: React.FC<CustomerSearchDropdownProps> = ({
                                                                           searchTerm,
                                                                           onSearchChange,
                                                                           searchResults,
                                                                           selectedCustomer,
                                                                           onSelectCustomer,
                                                                           onClearSelection,
                                                                           placeholder = "Search for customer (optional)",
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

    const handleSelectCustomer = (customer: CustomerSearchResultDTO) => {
        onSelectCustomer(customer);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleClearSelection = () => {
        if (onClearSelection) {
            onClearSelection();
        }
        onSearchChange('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleInputFocus = () => {
        if (searchTerm.length >= 2) {
            setIsOpen(true);
        }
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            {/* Selected Customer Display */}
            {selectedCustomer && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <User className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                                <div className="font-medium text-blue-900">
                                    {selectedCustomer.fullName}
                                </div>
                                <div className="text-sm text-blue-600">
                                    {selectedCustomer.email}
                                </div>
                            </div>
                        </div>
                        {onClearSelection && (
                            <button
                                onClick={handleClearSelection}
                                className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                title="Clear customer selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

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
                    {searchResults.map((customer) => (
                        <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {customer.fullName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {customer.email}
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
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No customers found</p>
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

export default CustomerSearchDropdown;