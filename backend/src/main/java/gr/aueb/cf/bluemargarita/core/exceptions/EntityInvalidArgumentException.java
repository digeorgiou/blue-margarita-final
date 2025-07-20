package gr.aueb.cf.bluemargarita.core.exceptions;

public class EntityInvalidArgumentException extends EntityGenericException {
    private static final String DEFAULT_CODE = "InvalidArgument";

    public EntityInvalidArgumentException(String code, String message) {
        super(code + DEFAULT_CODE, message);
    }
}
