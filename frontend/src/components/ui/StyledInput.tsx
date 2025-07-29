import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from 'react';
import { X, Package, Settings, User, Building2, Loader2 } from 'lucide-react';
import { GiDiamondRing } from "react-icons/gi";


interface StyledNumberInputProps {
    label: string | React.ReactNode;
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}



const baseInputClasses = `
     w-full pl-10 pr-4 py-3.5
    border-2 border-gray-200/60 rounded-xl
    bg-white/80 backdrop-blur-md
    text-gray-900 placeholder-gray-400
    shadow-sm shadow-blue-100/30
    transition-all duration-300 ease-out
    focus:border-blue-300 focus:ring-4 focus:ring-blue-100/50 focus:outline-none
    focus:bg-white/95 focus:shadow-md focus:shadow-blue-200/40
    hover:border-purple-200 hover:shadow-sm hover:shadow-purple-100/30
    hover:bg-white/85
    disabled:opacity-50 disabled:cursor-not-allowed
`;

const baseLabelClasses = "block text-sm font-semibold text-gray-700 mb-2";

export const StyledNumberInput: React.FC<StyledNumberInputProps> = ({
                                                                        label,
                                                                        value,
                                                                        onChange,
                                                                        placeholder = "0",
                                                                        icon,
                                                                        min = 0,
                                                                        max,
                                                                        step = 0.01,
                                                                        required = false,
                                                                        disabled = false,
                                                                        className = ""
                                                                    }) => {
    return (
        <div className={`relative ${className}`}>
            <label className={baseLabelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        {icon}
                    </div>
                )}

                <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(Number(e.target.value) || 0)}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    required={required}
                    className={`
                        ${baseInputClasses}
                        ${icon ? 'pl-10' : 'pl-4'}
                    `}
                />
            </div>
        </div>
    );
};


interface StyledSelectProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    options: Array<{ value: string | number; label: string }>;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
                                                              label,
                                                              value,
                                                              onChange,
                                                              options,
                                                              placeholder = "Select an option...",
                                                              icon,
                                                              required = false,
                                                              disabled = false,
                                                              className = ""
                                                          }) => {
    return (
        <div className={`relative ${className}`}>
            <label className={baseLabelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        {icon}
                    </div>
                )}

                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    className={`
                    ${baseInputClasses}
                    ${icon ? 'pl-10' : 'pl-4'}
                    pr-10
                    appearance-none
                    cursor-pointer
                    `}
                >
                    {/* Only show placeholder if no value is selected */}
                    {!value && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
            </div>
        </div>
    );
};

interface RadioOption {
    value: string;
    label: string;
}

interface StyledRadioGroupProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: RadioOption[];
    className?: string;
}

export const StyledRadioGroup: React.FC<StyledRadioGroupProps> = ({
                                                                      label,
                                                                      value,
                                                                      onChange,
                                                                      options,
                                                                      className = ""
                                                                  }) => {
    return (
        <div className={className}>
            {label && (<label className={baseLabelClasses}>
                {label}
            </label>)}

            <div className="flex items-center space-x-6">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="sr-only"
                        />
                        <div className={`
                            relative w-5 h-5 rounded-full border-2 transition-all duration-200
                            ${value === option.value
                            ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm shadow-blue-200/40'
                            : 'border-gray-300/60 bg-white/80 hover:border-purple-300 hover:bg-white/90'
                        }
                        `}>
                            {value === option.value && (
                                <div className="absolute inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
                            )}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

interface StyledDateInputProps {
    label: string | React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const StyledDateInput: React.FC<StyledDateInputProps> = ({
                                                                    label,
                                                                    value,
                                                                    onChange,
                                                                    icon,
                                                                    required = false,
                                                                    disabled = false,
                                                                    className = ""
                                                                }) => {
    return (
        <div className={`relative ${className}`}>
            <label className={baseLabelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        {icon}
                    </div>
                )}

                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    className={`
                        ${baseInputClasses}
                        ${icon ? 'pl-10' : 'pl-4'}
                    `}
                />
            </div>
        </div>
    );
};


interface SearchResult {
    id: number;
    name: string;
    additionalInfo?: string;
    subtitle?: string;
}

interface StyledSearchDropdownProps<T extends SearchResult> {
    // Required props
    label: string;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: T[];
    onSelect: (item: T) => void;
    placeholder: string;

    // Optional customization
    icon?: React.ReactNode;
    minSearchLength?: number;
    maxResults?: number;
    emptyMessage?: string;
    emptySubMessage?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;

    // Custom rendering functions
    renderItem?: (item: T) => React.ReactNode;
    renderAdditionalInfo?: (item: T) => React.ReactNode;

    // Loading state
    isLoading?: boolean;

    // Entity type for default styling/icons
    entityType?: 'material' | 'procedure' | 'product' | 'customer' | 'supplier';

    // Selected item display
    selectedItem?: T | null;
    onClearSelection?: () => void;
    renderSelectedItem?: (item: T, onClear: () => void) => React.ReactNode;
}

export function StyledSearchDropdown<T extends SearchResult>({
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
                                                             }: StyledSearchDropdownProps<T>) {
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
            defaultIcon: <GiDiamondRing className="w-5 h-5 text-green-500" />,
            emptyIcon: <GiDiamondRing className="w-6 h-6 text-gray-400" />
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
                                    hover:${colors.bg} hover:${colors.border}
                                    group
                                    ${index === highlightedIndex ? `${colors.bg} ${colors.border}` : ''}
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

