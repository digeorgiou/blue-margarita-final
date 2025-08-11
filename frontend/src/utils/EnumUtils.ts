export const getPaymentMethodDisplayName = (paymentMethod: string): string => {
    const paymentMethodMap: Record<string, string> = {
        'CASH': 'Μετρητά',
        'CARD': 'Κάρτα',
        'BANK_TRANSFER': 'Τραπεζική κατάθεση',
        'OTHER': 'Άλλο'
    };

    return paymentMethodMap[paymentMethod] || paymentMethod;
};

export const getExpenseTypeDisplayName = (expenseType: string): string => {
    const expenseTypeMap: Record<string, string> = {
        'PURCHASE_MATERIALS': "Αγορές Υλικών",
        'SALARY': "Μισθοδοσία",
        'RENT': "Ενοίκιο",
        'UTILITIES': "Λογαριασμοί",
        'MARKETING': "Διαφήμιση",
        'EQUIPMENT': "Εξοπλισμός",
        'INSURANCE': "Ασφάλιση",
        'TAXES': "Εφορία",
        'MAINTENANCE': "Συντήρηση",
        'TRANSPORTATION': "Μεταφορικά",
        'ACCOUNTANT': "Λογιστής",
        'PROFESSIONAL_SERVICES': "Άλλες Υπηρεσίες",
        'OTHER': "Διάφορα"
    };
    return expenseTypeMap[expenseType];
}

export const getPricingIssueTypeDisplayName = (pricingIssueType: string): string => {
    const pricingIssueTypeMap: Record<string, string> = {
        'RETAIL_UNDERPRICED': "ΧΑΜΗΛΗ ΛΙΑΝΙΚΗ",
        'WHOLESALE_UNDERPRICED': "ΧΑΜΗΛΗ ΧΟΝΔΡΙΚΗ",
        'BOTH_UNDERPRICED': "ΧΑΜΗΛΕΣ ΤΙΜΕΣ",
        'NO_ISSUES': "ΣΩΣΤΕΣ ΤΙΜΕΣ"
    };
    return pricingIssueTypeMap[pricingIssueType];
}

