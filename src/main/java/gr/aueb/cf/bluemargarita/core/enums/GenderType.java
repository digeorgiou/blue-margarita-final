package gr.aueb.cf.bluemargarita.core.enums;

public enum GenderType {
    FEMALE ("Γυναίκα"),
    MALE ("Άντρας"),
    OTHER("Άλλο");

    private String displayName;

    GenderType(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
