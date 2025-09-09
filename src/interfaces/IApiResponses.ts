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

    /** Site identifier */
    id_site?: number;

    /** Site type (eg. "centrale_w") */
    type?: string;

    /** Ecosystem name */
    ecosystem?: string;

    /** Streaming enabled on panel (1/0) */
    panel_streaming?: number;

    /** Panel serial number */
    panel_serial?: string;

    /** Current alarm panel status */
    panel_status?: number;

    /** Panel service/partition flags */
    panel_sp1?: number;
    panel_sp2?: number;
    panel_sp1_nom?: string;
    panel_sp2_nom?: string;

    /** List of service identifiers enabled for the site */
    services?: number[];

    /** Registered devices (sensors, zones, etc.) */
    devices?: IDevice[];

    /** Registered badges/users */
    badges?: IBadge[];

    /** Event history data */
    evenements?: IEvenement[];

    /** Locks (serrures) */
    serrures?: any[];

    /** Camera / streaming related fields */
    camera_token?: string;
    camera_available?: number;

    /** Various availability flags */
    panel_available?: number;
    streaming_available?: number;
    serrures_available?: number;
    looky_available?: number;

    /** Cameras and shares */
    cameras?: any[];
    partages?: any[];
}

/** Device / zone information returned by the site API */
export interface IDevice {
    serial?: string;
    device_id?: number;
    name?: string;
    picture?: string;
    [key: string]: any;
}

/** Badge / user information */
export interface IBadge {
    id_badge?: string | number;
    name?: string;
    alias?: string;
    code?: string;
    [key: string]: any;
}

/** Event history entry (evenement) */
export interface IEvenement {
    id_evenement?: number;
    option_id?: number;
    device?: string;
    message?: string;
    picture?: string;
    date?: number;
    status?: number;
    badge?: number;
    [key: string]: any;
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