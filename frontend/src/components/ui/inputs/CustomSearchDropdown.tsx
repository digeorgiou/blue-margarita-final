import React, { useState, useRef, useEffect } from 'react';
import { CustomSearchDropdownProps, SearchResult } from "../../../types/components/input-types.ts";
import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";
import { entityConfig, colorClasses } from "./search-dropdown-config.tsx";
import { Loader2 , X } from "lucide-react";

const CustomSearchDropdown = <T extends SearchResult>  ({
    label,
    searchTerm,
    onSearchTermChange,
    searchResults,
    onSelect,
    placeholder,
    icon,
    minSearchLength = 2,
    maxResults = 10,
    emptyMessage = "No results found",
    emptySubMessage = "Try a different search term",
    disabled = false,
    className = "",
    required = false,
    renderItem,
    renderAdditionalInfo,
    isLoading = false,
    entityType = 'material',
    selectedItem = null,
    onClearSelection,
    renderSelectedItem
} : CustomSearchDropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const shouldShowDropdown = isOpen && searchTerm.length >= minSearchLength;
    const displayResults = searchResults.slice(0, maxResults);

    const config = entityConfig[entityType];
    const colors = colorClasses[config.color];

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
            if (!shouldShowDropdown) return;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setHighlightedIndex(prev =>
                        prev < displayResults.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setHighlightedIndex(prev =>
                        prev > 0 ? prev - 1 : displayResults.length - 1
                    );
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (highlightedIndex >= 0 && displayResults[highlightedIndex]) {
                        handleSelect(displayResults[highlightedIndex]);
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
    }, [shouldShowDropdown, highlightedIndex, displayResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onSearchTermChange(value);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleSelect = (item: T) => {
        onSelect(item);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
    };

    const handleClear = () => {
        onSearchTermChange('');
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const defaultIcon = icon || config.defaultIcon;

    const defaultRenderItem = (item: T) => (
        <div className="flex-1">
            <div className={`font-medium text-gray-900 group-hover:${colors.text} transition-colors`}>
                {item.name}
            </div>
            {item.subtitle && (
                <div className="text-sm text-gray-500 mt-0.5">
                    {item.subtitle}
                </div>
            )}
        </div>
    );

    const defaultRenderAdditionalInfo = (item: T) => (
        item.additionalInfo ? (
            <div className={`text-xs ${colors.text} ${colors.bg} px-2 py-1 rounded-md`}>
                {item.additionalInfo}
            </div>
        ) : null
    );

    const defaultRenderSelectedItem = (item: T, onClear: () => void) => (
        <div className={`mt-3 p-3 ${colors.bg} rounded-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`font-medium ${colors.text}`}>{item.name}</p>
                    {item.subtitle && (
                        <p className={`text-sm ${colors.text} opacity-80`}>{item.subtitle}</p>
                    )}
                </div>
                <button
                    onClick={onClear}
                    className={`${colors.text} hover:opacity-80 transition-opacity`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <label className={baseLabelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    {defaultIcon}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        ${baseInputClasses}
                        pl-10 pr-12
                        ${shouldShowDropdown ? 'rounded-b-none border-b-0' : ''}
                        ${isOpen ? `focus:${colors.border} focus:${colors.ring}` : ''}
                    `}
                />

                {/* Loading spinner or clear button */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : searchTerm ? (
                        <button
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Dropdown Results */}
            {shouldShowDropdown && (
                <div className="absolute z-50 w-full bg-white border-2 border-gray-200 border-t-0 rounded-b-xl shadow-lg max-h-60 overflow-y-auto">
                    {displayResults.length > 0 ? (
                        displayResults.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={`
                                    w-full px-4 py-3 text-left
                                    flex items-center justify-between
                                    border-b border-gray-100 last:border-b-0
                                    transition-all duration-200
                                    ${colors.hover}
                                    group
                                    ${index === highlightedIndex ? colors.active : ''}
                                `}
                            >
                                <div className="flex items-center space-x-3 flex-1">
                                    <div className={`w-2 h-2 rounded-full ${colors.dot} opacity-60`} />
                                    {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                </div>
                                {renderAdditionalInfo ? renderAdditionalInfo(item) : defaultRenderAdditionalInfo(item)}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                            <div className="flex flex-col items-center space-y-2">
                                {config.emptyIcon}
                                <div>
                                    <p className="text-sm font-medium">{emptyMessage}</p>
                                    <p className="text-xs">{emptySubMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search instruction */}
            {isOpen && searchTerm.length > 0 && searchTerm.length < minSearchLength && (
                <div className="absolute z-50 w-full bg-white border-2 border-gray-200 border-t-0 rounded-b-xl shadow-lg p-4 text-center text-gray-500">
                    <p className="text-sm">Type at least {minSearchLength} characters to search</p>
                </div>
            )}

            {/* Selected item display */}
            {selectedItem && onClearSelection && (
                renderSelectedItem ? renderSelectedItem(selectedItem, onClearSelection) : defaultRenderSelectedItem(selectedItem, onClearSelection)
            )}
        </div>
    );
}

export default CustomSearchDropdown;