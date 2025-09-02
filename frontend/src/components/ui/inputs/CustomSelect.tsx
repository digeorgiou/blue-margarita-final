import React from "react";
import { ChevronDown } from "lucide-react";
import { CustomSelectProps } from "../../../types/components/input-types.ts";
import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";


const CustomSelect: React.FC<CustomSelectProps> = ({
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
                    {/* Show placeholder only if value is empty AND there's no option with empty value */}
                    {!value && !options.some(option => option.value === '') && (
                        <option value="">{placeholder}</option>
                    )}

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

export default CustomSelect;