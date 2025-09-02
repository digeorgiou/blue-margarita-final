import React from "react";
import { CustomNumberInputProps } from "../../../types/components/input-types.ts";
import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";

/**
 * Rounds a number to the specified number of decimal places
 * Uses Math.round to avoid floating point precision issues
 */
const roundToDecimals = (value: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
};

/**
 * Determines the number of decimal places to round to based on the step value
 * For pricing/discount inputs, we typically want 2 decimal places
 */
const getDecimalPlacesFromStep = (step?: number): number => {
    if (!step) return 2; // Default to 2 decimal places for currency/percentage

    // Convert step to string and count decimal places
    const stepStr = step.toString();
    const decimalIndex = stepStr.indexOf('.');

    if (decimalIndex === -1) return 0; // No decimals in step
    return stepStr.length - decimalIndex - 1;
};

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
                                                                 error,
                                                                 autoRoundDecimals = true
                                                             }) => {
    const decimalPlaces = getDecimalPlacesFromStep(step);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input
        if (inputValue === '') {
            onChange(0);
            return;
        }

        // Parse the number
        const numericValue = parseFloat(inputValue);

        // Handle invalid numbers
        if (isNaN(numericValue)) {
            onChange(0);
            return;
        }

        // Apply min/max constraints
        let constrainedValue = numericValue;
        if (min !== undefined && constrainedValue < min) {
            constrainedValue = min;
        }
        if (max !== undefined && constrainedValue > max) {
            constrainedValue = max;
        }

        // Auto-round to appropriate decimal places if enabled
        const finalValue = autoRoundDecimals
            ? roundToDecimals(constrainedValue, decimalPlaces)
            : constrainedValue;

        onChange(finalValue);
    };

    const handleInputBlur = () => {
        if (autoRoundDecimals && value) {
            const roundedValue = roundToDecimals(value, decimalPlaces);
            if (roundedValue !== value) {
                onChange(roundedValue);
            }
        }
    };

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
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
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