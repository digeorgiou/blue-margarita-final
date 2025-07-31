export const getPaymentMethodDisplayName = (paymentMethod: string): string => {
    const paymentMethodMap: Record<string, string> = {
        'CASH': 'Μετρητά',
        'CARD': 'Κάρτα',
        'BANK_TRANSFER': 'Τραπεζική κατάθεση',
        'OTHER': 'Άλλο'
    };

    return paymentMethodMap[paymentMethod] || paymentMethod;
};