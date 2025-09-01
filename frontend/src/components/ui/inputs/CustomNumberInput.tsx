import React from "react";
import {CustomNumberInputProps} from "../../../types/components/input-types.ts";
import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
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
                                                                 className = "",
                                                                 error
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
                        ${error
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-red-100/50 hover:border-red-400'
                        : 'border-gray-200/60 focus:border-blue-300 focus:ring-blue-100/50 hover:border-purple-200'
                        }
                    `}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                </p>
            )}
        </div>
    );
};

export default CustomNumberInput;