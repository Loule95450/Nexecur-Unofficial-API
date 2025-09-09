/**
 * Configuration interface for user credentials and device information
 */
export interface IUserConfiguration {
    /** Authentication token for API requests */
    token: string;
    
    /** Site identification number (wiring code) */
    idSite: string;
    
    /** User password (will be hashed) */
    password: string;
    
    /** Device identifier */
    idDevice: string;
    
    /** PIN code (will be hashed) */
    pin: string;
    
    /** Display name for the device */
    deviceName: string;
}