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

export default CustomNumberInput;