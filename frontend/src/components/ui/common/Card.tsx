import type {CardProps} from "../../../types/components/card.ts";

const Card = ({ children, title, icon, className = ''} : CardProps) => {
    return (
        <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {icon && <span className="text-2xl mr-3">{icon}</span>}
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}

export default Card;