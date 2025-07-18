package gr.aueb.cf.bluemargarita.core.enums;

public enum PaymentMethod {
    CASH ("Μετρητά"),
    CARD ("Κάρτα"),
    BANK_TRANSFER("Τραπεζική Κατάθεση"),
    OTHER("Άλλο");


    private String displayName;

    PaymentMethod(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
