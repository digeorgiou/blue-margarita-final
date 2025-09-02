import {AlertProps} from "../../../types/components/common-types.ts";
import { variantClassesAlert } from "./config.tsx";

const Alert = ({
    children,
    variant = 'info',
    className = '',
    onClose,
    title
               }: AlertProps) => {

    const config = variantClassesAlert[variant];

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