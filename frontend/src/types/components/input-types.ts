import React from "react";

export type CustomNumberInputProps = {
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

export type CustomTextInputProps = {
    label: string | React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url';
    required?: boolean;
    disabled?: boolean;
    className?: string;
    maxLength?: number;
    minLength?: number;
    autoComplete?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export type CustomSelectProps = {
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

export type CustomToggleOptionProps = {
    label?: string;
    value: boolean;
    onChange: (value: boolean) => void;
    optionLabel?: string;
    className?: string;
}

export type RadioOption = {
    value: string;
    label: string;
}

export type CustomRadioGroupProps = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: RadioOption[];
    className?: string;
}

export type CustomDateInputProps = {
    label: string | React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export type SearchResult = {
    id: number;
    name: string;
    additionalInfo?: string;
    subtitle?: string;
}

export type CustomSearchDropdownProps<T extends SearchResult> = {
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

// Configuration types for SearchDropdown
export type EntityType = 'material' | 'procedure' | 'product' | 'customer' | 'supplier';

export type ColorVariant = 'blue' | 'purple' | 'green' | 'indigo' | 'orange';

export type EntityConfig = {
    color: ColorVariant;
    defaultIcon: React.ReactNode;
    emptyIcon: React.ReactNode;
}

export type ColorClasses = {
    border: string;
    ring: string;
    bg: string;
    highlight: string;
    text: string;
    dot: string;
}