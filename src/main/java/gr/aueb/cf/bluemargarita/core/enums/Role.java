package gr.aueb.cf.bluemargarita.core.enums;

public enum Role {
    ADMIN ("Διαχειριστής"),
    USER ("Απλός Χρήστης");

    private String displayName;

    Role(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
