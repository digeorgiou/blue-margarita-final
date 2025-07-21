import type {TaskStatProps} from "../../types/components/taskstat";

const TaskStat = ({number, label, color} : TaskStatProps) => {

    const colorClasses = {
        red: 'bg-red-50 border-red-200 text-red-800',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
        <div className={`rounded-lg p-4 border-2 text-center ${colorClasses[color]}`}>
            <div className="text-2xl font-bold mb-1">{number}</div>
            <div className="text-sm font-medium">{label}</div>
        </div>
    )
}

export default TaskStat;