/**
 * Utility functions for common operations
 */
export class Utils {
    /**
     * Creates a promise that resolves after the specified delay
     * @param milliseconds - Number of milliseconds to wait
     * @returns Promise that resolves after the delay
     */
    public static async sleep(milliseconds: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => resolve(), milliseconds);
        });
    }

    /**
     * Retries an async operation with exponential backoff
     * @param operation - Function to retry
     * @param maxRetries - Maximum number of retries
     * @param baseDelay - Base delay in milliseconds (default: 1000)
     * @returns Promise that resolves with the operation result
     */
    public static async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (attempt === maxRetries) {
                    throw lastError;
                }
                
                const delay = baseDelay * Math.pow(2, attempt);
                await this.sleep(delay);
            }
        }
        
        throw lastError!;
    }

    /**
     * Validates that a value is not null or undefined
     * @param value - Value to check
     * @param fieldName - Name of the field for error messages
     * @throws Error if value is null or undefined
     */
    public static requireNonNull<T>(value: T | null | undefined, fieldName: string): T {
        if (value == null) {
            throw new Error(`${fieldName} cannot be null or undefined`);
        }
        return value;
    }

    /**
     * Safely parses JSON string, returning default value on error
     * @param jsonString - JSON string to parse
     * @param defaultValue - Default value to return on parse error
     * @returns Parsed object or default value
     */
    public static safeJsonParse<T>(jsonString: string, defaultValue: T): T {
        try {
            return JSON.parse(jsonString);
        } catch {
            return defaultValue;
        }
    }

    /**
     * Checks if a string is empty or whitespace only
     * @param value - String to check
     * @returns True if string is empty or whitespace only
     */
    public static isEmptyOrWhitespace(value: string | null | undefined): boolean {
        return !value || value.trim().length === 0;
    }
}