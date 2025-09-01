export interface ResponseMessageDTO {
    code: string;
    description: string;
}

// ValidationException returns Map<String, String> as object
export interface ValidationErrors {
    [fieldName: string]: string;
}

// These are the ONLY two possible error response formats from our backend
export type BackendErrorResponse = ResponseMessageDTO | ValidationErrors;

// Enhanced error from fetch with structured data
export interface ApiError extends Error {
    status: number;
    data: BackendErrorResponse;
    response?: Response;
}

// Input types that can be passed to the handler
export type ApiErrorInput =
    | ApiError              // Enhanced error with backend data
    | Response             // Raw Response object
    | Error                // Generic errors (network, etc.)
    | string;              // Simple error messages

// Simplified result types based on your backend's exact behavior
export interface ValidationErrorResult {
    type: 'validation';
    fieldErrors: ValidationErrors;
    message: string;
}

export interface BusinessErrorResult {
    type: 'business';
    message: string;
    code: string;
    httpStatus: number;
}

export interface NetworkErrorResult {
    type: 'network';
    message: string;
}

export interface UnknownErrorResult {
    type: 'unknown';
    message: string;
}

// Union type for all possible results
export type ApiErrorResult =
    | ValidationErrorResult
    | BusinessErrorResult
    | NetworkErrorResult
    | UnknownErrorResult;

export class ApiErrorHandler {

    /**
     * Processes API errors from your specific backend error contract
     * @param error - The error from the API call
     * @returns Structured error information for UI display
     */
    static async handleApiError(error: ApiErrorInput): Promise<ApiErrorResult> {
        console.error('API Error:', error);

        try {
            // Handle enhanced ApiError (error with attached backend data)
            if (this.isApiError(error)) {
                return this.processBackendError(error.data, error.status);
            }

            // Handle raw Response object
            if (error instanceof Response) {
                const backendData = await error.json() as BackendErrorResponse;
                return this.processBackendError(backendData, error.status);
            }

            // Handle network/generic errors
            if (error instanceof Error) {
                if (this.isNetworkError(error)) {
                    return {
                        type: 'network',
                        message: 'Πρόβλημα σύνδεσης με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας.'
                    };
                }
                return {
                    type: 'unknown',
                    message: error.message || 'Παρουσιάστηκε απροσδόκητο σφάλμα'
                };
            }

            // Handle string errors
            if (typeof error === 'string') {
                return {
                    type: 'unknown',
                    message: error
                };
            }

            // Fallback
            return {
                type: 'unknown',
                message: 'Παρουσιάστηκε απροσδόκητο σφάλμα'
            };

        } catch (parseError) {
            console.error('Error parsing backend response:', parseError);
            return {
                type: 'unknown',
                message: 'Παρουσιάστηκε σφάλμα κατά την επεξεργασία της απόκρισης'
            };
        }
    }

    /**
     * Processes backend error data based on your exact ErrorHandler contract
     * @param data - Backend error data (either ResponseMessageDTO or ValidationErrors)
     * @param status - HTTP status code
     * @returns Structured error result
     */
    private static processBackendError(data: BackendErrorResponse, status: number): ApiErrorResult {
        // Check if it's a ResponseMessageDTO (has 'code' and 'description')
        if (this.isResponseMessageDTO(data)) {
            return {
                type: 'business',
                message: data.description,
                code: data.code,
                httpStatus: status
            };
        }

        // Otherwise it's ValidationErrors (Map<String, String> as object)
        if (this.isValidationErrors(data)) {
            return {
                type: 'validation',
                fieldErrors: data,
                message: 'Παρακαλώ διορθώστε τα σφάλματα στη φόρμα'
            };
        }

        // This should never happen with your backend, but fallback just in case
        return {
            type: 'unknown',
            message: `Απροσδόκητος τύπος σφάλματος από διακομιστή (${status})`
        };
    }

    // Type guards for backend response types
    private static isResponseMessageDTO(data: BackendErrorResponse): data is ResponseMessageDTO {
        return typeof data === 'object' &&
            data !== null &&
            'code' in data &&
            'description' in data &&
            typeof data.code === 'string' &&
            typeof data.description === 'string';
    }

    private static isValidationErrors(data: BackendErrorResponse): data is ValidationErrors {
        return typeof data === 'object' &&
            data !== null &&
            !this.isResponseMessageDTO(data) &&
            !Array.isArray(data);
    }

    // Type guard for enhanced API error
    private static isApiError(error: ApiErrorInput): error is ApiError {
        return error instanceof Error &&
            'status' in error &&
            'data' in error &&
            typeof (error as ApiError).status === 'number';
    }

    // Type guard for network errors
    private static isNetworkError(error: Error): boolean {
        return error.name === 'TypeError' &&
            (error.message.includes('fetch') ||
                error.message.includes('network') ||
                error.message.includes('Failed to fetch'));
    }

    /**
     * Enhanced fetch wrapper that automatically structures errors according to your backend contract
     * @param url - Request URL
     * @param options - Fetch options
     * @returns Response or throws structured ApiError
     */
    static async enhancedFetch(url: string, options: RequestInit = {}): Promise<Response> {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                // Parse backend error response
                let backendData: BackendErrorResponse;
                try {
                    backendData = await response.json();
                } catch (parseError) {
                    console.log(parseError)
                    // If JSON parsing fails, create a fallback ResponseMessageDTO-like structure
                    backendData = {
                        code: `HTTP_${response.status}`,
                        description: `HTTP ${response.status}: ${response.statusText}`
                    };
                }

                // Create structured API error
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
                error.status = response.status;
                error.data = backendData;
                error.response = response;

                throw error;
            }

            return response;
        } catch (error) {
            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                const networkError = new Error('Network error: Unable to connect to server');
                networkError.name = 'NetworkError';
                throw networkError;
            }

            // Re-throw other errors (including our structured ApiError)
            throw error;
        }
    }
}

// React hook for easier usage
export const useApiErrorHandler = () => {
    const handleError = async (error: ApiErrorInput): Promise<ApiErrorResult> => {
        return await ApiErrorHandler.handleApiError(error);
    };

    return { handleError };
};