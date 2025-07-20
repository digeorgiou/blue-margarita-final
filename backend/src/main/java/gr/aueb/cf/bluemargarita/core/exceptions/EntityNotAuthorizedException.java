package gr.aueb.cf.bluemargarita.core.exceptions;

public class EntityNotAuthorizedException extends EntityGenericException {
    private static final String DEFAULT_CODE = "NotAuthorized";

    public EntityNotAuthorizedException(String code, String message) {
        super(code + DEFAULT_CODE, message);
    }
}