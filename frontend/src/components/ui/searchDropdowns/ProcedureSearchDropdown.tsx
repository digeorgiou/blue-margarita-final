import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Cog } from 'lucide-react';
import { ProcedureForDropdownDTO } from '../../../types/api/procedureInterface';

interface ProcedureSearchDropdownProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchResults: ProcedureForDropdownDTO[];
    onSelectProcedure: (procedure: ProcedureForDropdownDTO | null) => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    label?: string;
    required?: boolean;
    selectedProcedure?: ProcedureForDropdownDTO | null;
}

const ProcedureSearchDropdown: React.FC<ProcedureSearchDropdownProps> = ({
                                                                             searchTerm,
                                                                             onSearchChange,
                                                                             searchResults,
                                                                             onSelectProcedure,
                                                                             placeholder = "Search procedures...",
                                                                             disabled = false,
                                                                             isLoading = false,
                                                                             className = "",
                                                                             label,
                                                                             required = false,
                                                                             selectedProcedure = null
                                                                         }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setHighlightedIndex(prev =>
                        prev < searchResults.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setHighlightedIndex(prev =>
                        prev > 0 ? prev - 1 : searchResults.length - 1
                    );
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
                        handleSelectProcedure(searchResults[highlightedIndex]);
                    }
                    break;
                case 'Escape':
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                    inputRef.current?.blur();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, searchResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onSearchChange(value);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleSelectProcedure = (procedure: ProcedureForDropdownDTO) => {
        console.log('Procedure clicked:', procedure);
        onSelectProcedure(procedure);
        onSearchChange(procedure.name);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
    };

    const handleInputFocus = () => {
        if (searchTerm.length >= 2) {
            setIsOpen(true);
        }
    };

    const handleClearSearch = () => {
        onSearchChange('');
        onSelectProcedure(null);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Selected Item Display */}
            {selectedProcedure && (
                <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                <Cog className="w-3 h-3 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-purple-900">
                                    {selectedProcedure.name}
                                </div>
                                <div className="text-xs text-purple-600">
                                    Επιλεγμένη διαδικασία
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onSelectProcedure(null)}
                            className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                            title="Clear procedure selection"
                        >
                            <X className="w-4 h-4" />
                        </button>
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
                        w-full pl-10 pr-10 py-2 border rounded-lg text-sm
                        transition-colors duration-200
                        placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                        ${isOpen ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-300 hover:border-gray-400'}
                    `}
                />

                {/* Clear button */}
                {searchTerm && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg p-4 text-center">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Searching procedures...</span>
                    </div>
                </div>
            )}

            {/* Dropdown Results */}
            {isOpen && !isLoading && searchTerm.length >= 2 && searchResults.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((procedure, index) => (
                        <div
                            key={procedure.id}
                            onClick={() => {
                                console.log('Procedure item clicked:', procedure);
                                handleSelectProcedure(procedure);
                            }}
                            className={`
                                px-4 py-3 cursor-pointer transition-colors duration-150
                                border-b border-gray-100 last:border-b-0
                                ${index === highlightedIndex
                                ? 'bg-purple-50 border-purple-200'
                                : 'hover:bg-gray-50'
                            }
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Cog className="w-4 h-4 text-purple-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                        {procedure.name}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-0.5">
                                        Manufacturing Process
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && searchTerm.length >= 2 && searchResults.length === 0 && !isLoading && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg p-4 text-center text-gray-500">
                    <Cog className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No procedures found</p>
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

export default ProcedureSearchDropdown;