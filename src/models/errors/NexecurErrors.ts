/**
 * Base class for all Nexecur API errors
 */
export abstract class NexecurError extends Error {
    /** Error code for categorization */
    public readonly code: string;
    
    /** Timestamp when the error occurred */
    public readonly timestamp: Date;
    
    /**
     * Creates a new NexecurError instance
     * @param message - Error message
     * @param code - Error code
     */
    constructor(message: string, code: string) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.timestamp = new Date();
        
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error thrown when salt generation fails
 */
export class SaltGenerationError extends NexecurError {
    constructor(message: string = 'Error while generating a new device. The script cannot get a new salt.') {
        super(message, 'SALT_GENERATION_ERROR');
    }
}

/**
 * Error thrown when token generation fails
 */
export class TokenGenerationError extends NexecurError {
    constructor(message: string = 'Error while getting a token for a new device.') {
        super(message, 'TOKEN_GENERATION_ERROR');
    }
}

/**
 * Error thrown when device registration fails
 */
export class RegisteringDeviceError extends NexecurError {
    constructor(message: string = 'Error while registering a new device. The script cannot update the device ID value.') {
        super(message, 'DEVICE_REGISTRATION_ERROR');
    }
}

/**
 * Error thrown when alarm operations fail
 */
export class OrderAlarmError extends NexecurError {
    constructor(message: string = 'Error while executing alarm operation.') {
        super(message, 'ALARM_ORDER_ERROR');
    }
}

/**
 * Error thrown when API operations fail with undefined errors
 */
export class UndefinedApiError extends NexecurError {
    constructor(message: string = 'An undefined API error occurred.') {
        super(message, 'UNDEFINED_API_ERROR');
    }
}

/**
 * Error thrown when operations remain pending for too long
 */
export class StillPendingError extends NexecurError {
    constructor(message: string = 'The operation (enabling or disabling the alarm) does not seem to be applied correctly.') {
        super(message, 'OPERATION_PENDING_ERROR');
    }
}