export const formatMoney = (amount: number): string => {
    return `€${amount.toLocaleString('el-GR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR');
};

export const formatTaskDate = (task: { date: string; daysFromToday: number }): string => {
    const date = formatDate(task.date);
    if (task.daysFromToday < 0) {
        return `${date} (${Math.abs(task.daysFromToday)} days overdue)`;
    } else if (task.daysFromToday === 0) {
        return `${date} (Today)`;
    } else {
        return `${date} (in ${task.daysFromToday} days)`;
    }
};