import React from "react";

import { baseLabelClasses} from "../styles/input-styles.ts";
import {CustomRadioGroupProps} from "../../../types/components/input-types.ts";

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
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

export default CustomRadioGroup;