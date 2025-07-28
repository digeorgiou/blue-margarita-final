import { ChevronDown } from "lucide-react";


interface StyledNumberInputProps {
    label: string;
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
                    <option value="">{placeholder}</option>
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

            <div className="flex items-center space-x-6 mt-3">
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
    label: string;
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

