export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatMoney = (amount: number): string => {
    return `€${amount.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('el-GR').format(num);
};

export const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatQuantity = (quantity: number, unit: string) => {
    return `${formatNumber(quantity)} ${unit}`;
};

export const formatPercentage = (num: number, decimals: number = 2) => {
    return `${num.toFixed(decimals)}%`;
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