import { baseLabelClasses} from "../styles/input-styles.ts";
import { CustomToggleOptionProps } from "../../../types/components/input-types.ts";
import React from "react";


const CustomToggleOption: React.FC<CustomToggleOptionProps> = ({
                                                                   label,
                                                                   value,
                                                                   onChange,
                                                                   optionLabel,
                                                                   className = ""
                                                               }) => {
    return (
        <div className={className}>
            {label && (
                <label className={baseLabelClasses}>
                    {label}
                </label>
            )}

            <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="sr-only"
                    />
                    <div className={`
                        relative w-5 h-5 rounded-full border-2 transition-all duration-200
                        ${value
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm shadow-blue-200/40'
                        : 'border-gray-300/60 bg-white/80 hover:border-purple-300 hover:bg-white/90'
                    }
                    `}>
                        {value && (
                            <div className="absolute inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
                        )}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                        {optionLabel}
                    </span>
                </label>
            </div>
        </div>
    );
};

export default CustomToggleOption;