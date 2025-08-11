export const getExpenseTypeColor = (expenseType: string) => {
    switch (expenseType.toLowerCase()) {
        case 'utilities':
            return 'text-blue-600 bg-blue-100';
        case 'rent':
            return 'text-purple-600 bg-purple-100';
        case 'marketing':
            return 'text-pink-600 bg-pink-100';
        case 'supplies':
            return 'text-green-600 bg-green-100';
        case 'equipment':
            return 'text-orange-600 bg-orange-100';
        case 'maintenance':
            return 'text-yellow-600 bg-yellow-100';
        case 'insurance':
            return 'text-indigo-600 bg-indigo-100';
        case 'legal':
            return 'text-gray-600 bg-gray-100';
        case 'travel':
            return 'text-teal-600 bg-teal-100';
        case 'other':
            return 'text-red-600 bg-red-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
};

export const getExpenseIcon = (expenseType: string) => {
    switch (expenseType.toLowerCase()) {
        case 'utilities':
            return '⚡';
        case 'salary':
            return '👥'
        case 'rent':
            return '🏢';
        case 'marketing':
            return '📢';
        case 'supplies':
            return '📦';
        case 'equipment':
            return '🔧';
        case 'maintenance':
            return '🛠️';
        case 'insurance':
            return '🛡️';
        case 'legal':
            return '⚖️';
        case 'travel':
            return '✈️';
        case 'other':
            return '💼';
        default:
            return '💰';
    }
};