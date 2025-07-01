package gr.aueb.cf.bluemargarita.core;


import gr.aueb.cf.bluemargarita.core.exceptions.*;
import gr.aueb.cf.bluemargarita.dto.ResponseMessageDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class ErrorHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String , String>> handleValidationException(ValidationException ex) {
        BindingResult bindingResult = ex.getBindingResult();

        Map<String , String> errors = new HashMap<>();
        for (FieldError fieldError : bindingResult.getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({EntityNotFoundException.class})
    public ResponseEntity<ResponseMessageDTO> handleConstraintViolationException(EntityNotFoundException e) {
        return new ResponseEntity<>(new ResponseMessageDTO(e.getCode(), e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({EntityAlreadyExistsException.class})
    public ResponseEntity<ResponseMessageDTO> handleConstraintViolationException(EntityAlreadyExistsException e) {
        return new ResponseEntity<>(new ResponseMessageDTO(e.getCode(), e.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler({EntityInvalidArgumentException.class})
    public ResponseEntity<ResponseMessageDTO> handleConstraintViolationException(EntityInvalidArgumentException e) {
        return new ResponseEntity<>(new ResponseMessageDTO(e.getCode(), e.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({EntityNotAuthorizedException.class})
    public ResponseEntity<ResponseMessageDTO> handleConstraintViolationException(EntityNotAuthorizedException e) {
        return new ResponseEntity<>(new ResponseMessageDTO(e.getCode(), e.getMessage()), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({AppServerException.class})
    public ResponseEntity<ResponseMessageDTO> handleConstraintViolationException(AppServerException e) {
        return new ResponseEntity<>(new ResponseMessageDTO(e.getCode(), e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
