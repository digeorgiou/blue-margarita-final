package gr.aueb.cf.bluemargarita.core.enums;

public enum StockStatus {
    NORMAL("Κανονικό Απόθεμα"),
    LOW("Χαμηλό Απόθεμα"),
    NEGATIVE("Αρνητικό Απόθεμα");


    private final String displayName;

    StockStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Helper method to convert from string
    public static StockStatus fromString(String status) {
        if (status == null) return null;
        try {
            return StockStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

}
