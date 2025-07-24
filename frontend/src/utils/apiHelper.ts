// Helper to clean filter parameters
export const cleanFilterParams = (params: Record<string, any>) => {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) =>
            value !== '' && value !== null && value !== undefined
        )
    );
};