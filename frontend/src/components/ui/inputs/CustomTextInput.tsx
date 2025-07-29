import { baseInputClasses , baseLabelClasses} from "../styles/input-styles.ts";
import { CustomTextInputProps } from "../../../types/components/input-types.ts";

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
                                                             onKeyDown
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
                    `}
                />
            </div>
        </div>
    );
};

export default CustomTextInput;