package gr.aueb.cf.bluemargarita.core.enums;

public enum PricingIssueType {
    RETAIL_UNDERPRICED("ΧΑΜΗΛΗ ΛΙΑΝΙΚΗ"),
    WHOLESALE_UNDERPRICED("ΧΑΜΗΛΗ ΧΟΝΔΡΙΚΗ"),
    BOTH_UNDERPRICED("ΧΑΜΗΛΗ ΛΙΑΝΙΚΗ ΚΑΙ ΧΟΝΔΡΙΚΗ"),
    NO_ISSUES("ΣΩΣΤΕΣ ΤΙΜΕΣ");

    private final String description;

    PricingIssueType(String description){
        this.description = description;
    }
}
