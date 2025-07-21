import {InputProps} from "../../types/components/input";

const Input = ({
            label,
            placeholder,
            value,
            onChange,
            type = "text",
            required = false,
            disabled = false,
            error,
            className = '',
            id
               }: InputProps) => {

    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`
    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Field */}
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`
          w-full px-3 py-2 border rounded-lg text-sm
          transition-colors duration-200
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          ${error
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                }
        `}
            />

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;