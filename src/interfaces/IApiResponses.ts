/**
 * Standard API response interface for Nexecur services
 */
export interface IApiResponse {
    /** Response status message */
    message: string;
    
    /** Numeric status code (0 = success) */
    status: number;
    
    /** Additional response data */
    [key: string]: any;
}

/**
 * Response interface for salt generation requests
 */
export interface ISaltResponse extends IApiResponse {
    /** Base64 encoded salt value */
    salt: string;
}

/**
 * Response interface for site/authentication requests
 */
export interface ISiteResponse extends IApiResponse {
    /** Authentication token */
    token: string;
    
    /** Current alarm panel status */
    panel_status: number;
    
    /** Event history data */
    evenements: any[];
}

/**
 * Response interface for device registration
 */
export interface IRegisterResponse extends IApiResponse {
    /** Assigned device identifier */
    id_device: string;
}

/**
 * Response interface for panel status operations
 */
export interface IPanelStatusResponse extends IApiResponse {
    /** Whether the operation is still pending (1 = pending, 0 = completed) */
    pending: number;
}

/**
 * Response interface for panel status checks
 */
export interface IPanelCheckResponse extends IApiResponse {
    /** Whether the operation is still pending (1 = pending, 0 = completed) */
    still_pending: number;
}