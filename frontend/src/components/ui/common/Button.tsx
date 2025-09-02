import {ButtonProps} from '../../../types/components/common-types.ts'
import { baseClassesButton, variantClassesButton, sizeClassesButton } from "./config.tsx";

const Button = ({children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '', title} : ButtonProps) => {

    const disabledClasses = disabled
        ? "opacity-50 cursor-not-allowed shadow-none"
        : "hover:scale-[1.02] hover:-translate-y-0.5";

    return (
        <button className={`${baseClassesButton} ${variantClassesButton[variant]} ${sizeClassesButton[size]} ${disabledClasses} ${className}`}
                onClick={onClick}
                disabled={disabled}
                title={title}
                type={type}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>

            {!variant.includes('outline') && !variant.includes('ghost') && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500
                               group-hover:animate-pulse" />
            )}

        </button>
    )
}

export default Button;