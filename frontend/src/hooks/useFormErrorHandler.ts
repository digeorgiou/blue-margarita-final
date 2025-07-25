// src/hooks/useFormErrorHandler.ts

import { useState } from 'react';
import { ApiErrorHandler, ApiErrorInput, ValidationErrors } from '../utils/apiErrorHandler';

interface UseFormErrorHandlerReturn {
    fieldErrors: ValidationErrors;
    generalError: string;
    setFieldErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
    setGeneralError: React.Dispatch<React.SetStateAction<string>>;
    handleApiError: (error: unknown) => Promise<void>; // Accept unknown for easier usage
    clearErrors: () => void;
    clearFieldError: (fieldName: string) => void;
}

interface FormErrorOptions {
    // Optional: Custom handling for specific error codes
    customErrorHandling?: {
        [errorCode: string]: (message: string) => void;
    };
    // Optional: Convert business errors to field errors for specific cases
    businessErrorToFieldMap?: {
        [errorCode: string]: string; // errorCode -> fieldName
    };
}

export const useFormErrorHandler = (options: FormErrorOptions = {}): UseFormErrorHandlerReturn => {
    const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState<string>('');

    const handleApiError = async (error: unknown): Promise<void> => {
        // Cast to ApiErrorInput since ApiErrorHandler.handleApiError accepts this type
        const errorResult = await ApiErrorHandler.handleApiError(error as ApiErrorInput);

        // Clear previous errors
        setFieldErrors({});
        setGeneralError('');

        switch (errorResult.type) {
            case 'validation':
                // ValidationException -> Map<String, String> -> field errors
                setFieldErrors(errorResult.fieldErrors);
                setGeneralError(errorResult.message);
                break;

            case 'business': {
                // Check if this business error should be mapped to a specific field
                const fieldName = options.businessErrorToFieldMap?.[errorResult.code];
                if (fieldName) {
                    setFieldErrors({ [fieldName]: errorResult.message });
                } else {
                    setGeneralError(errorResult.message);
                }

                // Check for custom handling
                const customHandler = options.customErrorHandling?.[errorResult.code];
                if (customHandler) {
                    customHandler(errorResult.message);
                }
                break;
            }

            case 'network':
                setGeneralError(`🌐 ${errorResult.message}`);
                break;

            case 'unknown':
                setGeneralError(`❌ ${errorResult.message}`);
                break;

            default: {
                const _exhaustiveCheck: never = errorResult;
                console.error(_exhaustiveCheck);
                setGeneralError('Παρουσιάστηκε απροσδόκητο σφάλμα');
                break;
            }
        }
    };

    const clearErrors = () => {
        setFieldErrors({});
        setGeneralError('');
    };

    const clearFieldError = (fieldName: string) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    return {
        fieldErrors,
        generalError,
        setFieldErrors,
        setGeneralError,
        handleApiError,
        clearErrors,
        clearFieldError
    };
};