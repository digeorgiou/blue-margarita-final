import {AlertProps} from "../../types/components/alert.ts";

const Alert = ({
    children,
    variant = 'info',
    className = '',
    onClose,
    title
               }: AlertProps) => {

    const variantClasses = {
        success: {
            container: "bg-green-50 border-green-200 text-green-800",
            icon: "✅",
            iconColor: "text-green-500"
        },
        error: {
            container: "bg-red-50 border-red-200 text-red-800",
            icon: "❌",
            iconColor: "text-red-500"
        },
        warning: {
            container: "bg-yellow-50 border-yellow-200 text-yellow-800",
            icon: "⚠️",
            iconColor: "text-yellow-500"
        },
        info: {
            container: "bg-blue-50 border-blue-200 text-blue-800",
            icon: "ℹ️",
            iconColor: "text-blue-500"
        }
    };

    const config = variantClasses[variant];

    return (
        <div className={`
      border rounded-lg p-4 
      ${config.container} 
      ${className}
    `}>
            <div className="flex items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 mr-3 ${config.iconColor}`}>
                    <span className="text-lg">{config.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Title (optional) */}
                    {title && (
                        <h3 className="text-sm font-semibold mb-1">
                            {title}
                        </h3>
                    )}

                    {/* Message */}
                    <div className="text-sm">
                        {children}
                    </div>
                </div>

                {/* Close Button (optional) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`
              flex-shrink-0 ml-3 p-1 rounded-md
              hover:bg-white hover:bg-opacity-20
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${config.iconColor}
              transition-colors duration-200
            `}
                        aria-label="Close alert"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default Alert;