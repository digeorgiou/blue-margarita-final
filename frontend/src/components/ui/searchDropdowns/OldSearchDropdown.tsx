// Enhanced UniversalSearchDropdown.tsx - Now supports all entity types

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Package, Settings, User, Building2, ShoppingCart } from 'lucide-react';

interface SearchResult {
    id: number;
    name: string;
    additionalInfo?: string;
    subtitle?: string;
}

interface UniversalSearchDropdownProps<T extends SearchResult> {
    // Required props
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: T[];
    onSelect: (item: T) => void;
    placeholder: string;

    // Optional customization
    label?: string;
    icon?: React.ReactNode;
    minSearchLength?: number;
    maxResults?: number;
    emptyMessage?: string;
    emptySubMessage?: string;
    disabled?: boolean;
    className?: string;

    // Custom rendering functions
    renderItem?: (item: T) => React.ReactNode;
    renderAdditionalInfo?: (item: T) => React.ReactNode;

    // Loading state
    isLoading?: boolean;

    // Entity type for default styling/icons
    entityType?: 'material' | 'procedure' | 'product' | 'customer' | 'supplier';
}

function UniversalSearchDropdown<T extends SearchResult>({
                                                             searchTerm,
                                                             onSearchTermChange,
                                                             searchResults,
                                                             onSelect,
                                                             placeholder,
                                                             label,
                                                             icon,
                                                             minSearchLength = 2,
                                                             maxResults = 10,
                                                             emptyMessage = "No results found",
                                                             emptySubMessage = "Try a different search term",
                                                             disabled = false,
                                                             className = "",
                                                             renderItem,
                                                             renderAdditionalInfo,
                                                             isLoading = false,
                                                             entityType = 'material'
                                                         }: UniversalSearchDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const shouldShowDropdown = isOpen && searchTerm.length >= minSearchLength;
    const displayResults = searchResults.slice(0, maxResults);

    // Entity-specific styling
    const entityConfig = {
        material: {
            color: 'blue',
            defaultIcon: <Package className="w-5 h-5 text-blue-500" />,
            emptyIcon: <Package className="w-6 h-6 text-gray-400" />
        },
        procedure: {
            color: 'purple',
            defaultIcon: <Settings className="w-5 h-5 text-purple-500" />,
            emptyIcon: <Settings className="w-6 h-6 text-gray-400" />
        },
        product: {
            color: 'green',
            defaultIcon: <ShoppingCart className="w-5 h-5 text-green-500" />,
            emptyIcon: <ShoppingCart className="w-6 h-6 text-gray-400" />
        },
        customer: {
            color: 'indigo',
            defaultIcon: <User className="w-5 h-5 text-indigo-500" />,
            emptyIcon: <User className="w-6 h-6 text-gray-400" />
        },
        supplier: {
            color: 'orange',
            defaultIcon: <Building2 className="w-5 h-5 text-orange-500" />,
            emptyIcon: <Building2 className="w-6 h-6 text-gray-400" />
        }
    };

    const config = entityConfig[entityType];
    const colorClasses = {
        blue: {
            border: 'border-blue-500',
            ring: 'ring-blue-100',
            bg: 'bg-blue-50',
            highlight: 'bg-blue-50 border-blue-500',
            text: 'text-blue-700',
            dot: 'bg-blue-500'
        },
        purple: {
            border: 'border-purple-500',
            ring: 'ring-purple-100',
            bg: 'bg-purple-50',
            highlight: 'bg-purple-50 border-purple-500',
            text: 'text-purple-700',
            dot: 'bg-purple-500'
        },
        green: {
            border: 'border-green-500',
            ring: 'ring-green-100',
            bg: 'bg-green-50',
            highlight: 'bg-green-50 border-green-500',
            text: 'text-green-700',
            dot: 'bg-green-500'
        },
        indigo: {
            border: 'border-indigo-500',
            ring: 'ring-indigo-100',
            bg: 'bg-indigo-50',
            highlight: 'bg-indigo-50 border-indigo-500',
            text: 'text-indigo-700',
            dot: 'bg-indigo-500'
        },
        orange: {
            border: 'border-orange-500',
            ring: 'ring-orange-100',
            bg: 'bg-orange-50',
            highlight: 'bg-orange-50 border-orange-500',
            text: 'text-orange-700',
            dot: 'bg-orange-500'
        }
    };

    const colors = colorClasses[config.color as keyof typeof colorClasses];

    // Handle clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!shouldShowDropdown) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex(prev =>
                        prev < displayResults.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex(prev =>
                        prev > 0 ? prev - 1 : displayResults.length - 1
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
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

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}

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
                        w-full pl-10 pr-12 py-3.5
                        border-2 border-gray-200 rounded-xl
                        bg-white/70 backdrop-blur-sm
                        text-gray-900 placeholder-gray-500
                        shadow-sm
                        transition-all duration-300 ease-out
                        focus:${colors.border} focus:ring-4 focus:${colors.ring}
                        focus:bg-white focus:shadow-md
                        hover:border-gray-300 hover:shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${shouldShowDropdown ? 'rounded-b-none border-b-0' : ''}
                    `}
                />

                {/* Clear button */}
                {searchTerm && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2
                                 p-1 text-gray-400 hover:text-gray-600
                                 transition-colors duration-200 z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className={`animate-spin rounded-full h-4 w-4 border-2 ${colors.border} border-t-transparent`}></div>
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {shouldShowDropdown && (
                <div
                    ref={dropdownRef}
                    className={`absolute z-50 w-full bg-white/95 backdrop-blur-sm
                             border-2 border-t-0 ${colors.border}
                             rounded-b-xl rounded-t-none
                             shadow-xl shadow-${config.color}-100/50
                             max-h-80 overflow-y-auto
                             transition-all duration-200 ease-out`}
                >
                    {displayResults.length > 0 ? (
                        <div className="py-2">
                            {displayResults.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelect(item);
                                    }}
                                    className={`
                                        group w-full px-4 py-3 text-left
                                        flex items-center justify-between
                                        transition-all duration-150 ease-out
                                        ${index === highlightedIndex
                                        ? `${colors.highlight} border-l-4`
                                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                                    }
                                        focus:outline-none focus:${colors.highlight} focus:border-l-4
                                    `}
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className={`
                                            flex-shrink-0 w-2 h-2 rounded-full
                                            transition-colors duration-150
                                            ${index === highlightedIndex
                                            ? colors.dot
                                            : `bg-gray-300 group-hover:${colors.dot.replace('bg-', 'bg-').replace('-500', '-400')}`
                                        }
                                        `}></div>

                                        {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                    </div>

                                    {renderAdditionalInfo ?
                                        renderAdditionalInfo(item) :
                                        defaultRenderAdditionalInfo(item)
                                    }
                                </button>
                            ))}
                        </div>
                    ) : !isLoading ? (
                        <div className="py-8 text-center">
                            <div className={`w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center`}>
                                {config.emptyIcon}
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                {emptyMessage}
                            </p>
                            <p className="text-xs text-gray-500">
                                {emptySubMessage}
                            </p>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <div className={`w-12 h-12 mx-auto mb-3 ${colors.bg} rounded-full flex items-center justify-center`}>
                                <div className={`animate-spin rounded-full h-6 w-6 border-2 ${colors.border} border-t-transparent`}></div>
                            </div>
                            <p className="text-sm text-gray-600">Searching...</p>
                        </div>
                    )}

                    {/* Search hint */}
                    {searchTerm.length < minSearchLength && (
                        <div className={`px-4 py-3 ${colors.bg} border-t border-${config.color}-100`}>
                            <p className={`text-xs ${colors.text}`}>
                                Type at least {minSearchLength} characters to search
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UniversalSearchDropdown;