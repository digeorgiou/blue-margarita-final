package gr.aueb.cf.bluemargarita.core.enums;

public enum TaskStatus {
    PENDING ("Εκκρεμεί"),     // Task is not yet completed
    COMPLETED("Ολοκληρωμένο"),   // Task has been completed
    CANCELLED("Ακυρωμένο"); // Task was cancelled/no longer needed (optional for future use)

    private String displayName;

    TaskStatus(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
