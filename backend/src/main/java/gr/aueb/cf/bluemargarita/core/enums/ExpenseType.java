package gr.aueb.cf.bluemargarita.core.enums;

public enum ExpenseType {
    PURCHASE_MATERIALS ("Αγορές Υλικών"),    // Purchase of materials/inventory
    SALARY ("Μισθοδοσία"),               // Employee salaries
    RENT("Ενοίκιο"),                 // Store/workshop rent
    UTILITIES("Λογαριασμοί"),            // Electricity, water, internet
    MARKETING("Διαφήμιση"),            // Advertising and promotion
    EQUIPMENT("Εξοπλισμός"),            // Tools and equipment
    INSURANCE("Ασφάλιση"),            // Business insurance
    TAXES("Εφορία"),                // Business taxes
    MAINTENANCE("Συντήρηση"),          // Equipment maintenance
    TRANSPORTATION("Μεταφορικά"),       // Delivery, travel expenses
    ACCOUNTANT("Λογιστής"),            // Accounting service
    PROFESSIONAL_SERVICES("Άλλες Υπηρεσίες"), // Legal or other professional services
    OTHER("Διάφορα"); // Miscellaneous expenses

    private String displayName;

    ExpenseType(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}
