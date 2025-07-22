import {ButtonProps} from '../../types/components/button'

const Button = ({children, onClick, variant = 'primary', size = 'md', disabled, type = 'button'} : ButtonProps) => {

    const baseClasses = "font-medium rounded-lg transition-all duration-200 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
        success: "bg-green-600 hover:bg-green-700 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white"
    }

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const disabledClasses = disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:scale-105 active:scale-95";

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
                onClick={onClick}
                disabled={disabled}
                type={type}
        >
            {children}
        </button>
    )
}

export default Button;