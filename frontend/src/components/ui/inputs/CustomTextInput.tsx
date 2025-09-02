import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";
import { CustomTextInputProps } from "../../../types/components/input-types.ts";
import React from "react";

const CustomTextInput: React.FC<CustomTextInputProps> = ({
                                                             label,
                                                             value,
                                                             onChange,
                                                             placeholder = "",
                                                             icon,
                                                             type = "text",
                                                             required = false,
                                                             disabled = false,
                                                             className = "",
                                                             maxLength,
                                                             minLength,
                                                             autoComplete,
                                                             onFocus,
                                                             onBlur,
                                                             onKeyDown,
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
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    minLength={minLength}
                    autoComplete={autoComplete}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
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
            {/* Error Message  */}
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                </p>
            )}
        </div>
    );
};

export default CustomTextInput;