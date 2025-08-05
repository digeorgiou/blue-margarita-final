import type {ListItemProps} from "../../../types/components/listitem.ts";

const ListItem = ({
                      primaryText,
                      secondaryText,
                      rightText,
                      rightTextColor = 'blue',
                      isWarning = false
                  }: ListItemProps) => {

    const rightColorClasses = {
        green: 'text-green-600',
        red: 'text-red-600',
        blue: 'text-blue-600'
    };

    return (
        <div className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${
            isWarning
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-gray-50 border-blue-400'
        }`}>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{primaryText}</p>
                <p className="text-sm text-gray-600">{secondaryText}</p>
            </div>
            <div className={`font-bold ${rightColorClasses[rightTextColor]}`}>
                {rightText}
            </div>
        </div>
    );
}

export default ListItem;