import type {StatCardProps} from "../../../types/components/statcard.ts";

const StatCard= ({label, value , isBig = false, color = 'blue'} : StatCardProps)=>{

    const colorClasses = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
    }

    return (
        <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className={`font-bold ${isBig ? 'text-3xl' : 'text-2xl'} ${colorClasses[color]}`}>
                {value}
            </p>
        </div>
    )
}

export default StatCard;