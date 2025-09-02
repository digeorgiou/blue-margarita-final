import React from "react";
import { CustomDateInputProps } from "../../../types/components/input-types.ts";
import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";

const CustomDateInput: React.FC<CustomDateInputProps> = ({
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

export default CustomDateInput;