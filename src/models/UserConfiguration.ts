import { IUserConfiguration } from '../interfaces/IUserConfiguration';

/**
 * User configuration class that manages authentication and device settings
 */
export class UserConfiguration implements IUserConfiguration {
    public token: string;
    public idSite: string;
    public password: string;
    public idDevice: string;
    public pin: string;
    public deviceName: string;

    /**
     * Creates a new UserConfiguration instance
     * @param config - Configuration object
     */
    constructor(config: Partial<IUserConfiguration> = {}) {
        this.token = config.token || '';
        this.idSite = config.idSite || '';
        this.password = config.password || '';
        this.idDevice = config.idDevice || '';
        this.pin = config.pin || '';
        this.deviceName = config.deviceName || '';
    }

    /**
     * Validates that required configuration fields are present
     * @returns True if configuration is valid
     */
    public isValid(): boolean {
        return !!(this.idSite && this.password);
    }

    /**
     * Checks if device is registered (has token and device ID)
     * @returns True if device is registered
     */
    public isDeviceRegistered(): boolean {
        return !!(this.token && this.idDevice);
    }

    /**
     * Creates a copy of the configuration
     * @returns New UserConfiguration instance
     */
    public clone(): UserConfiguration {
        return new UserConfiguration({
            token: this.token,
            idSite: this.idSite,
            password: this.password,
            idDevice: this.idDevice,
            pin: this.pin,
            deviceName: this.deviceName
        });
    }

    /**
     * Converts to plain object for JSON serialization
     * @returns Plain object representation
     */
    public toJSON(): IUserConfiguration {
        return {
            token: this.token,
            idSite: this.idSite,
            password: this.password,
            idDevice: this.idDevice,
            pin: this.pin,
            deviceName: this.deviceName
        };
    }

    /**
     * Creates UserConfiguration from plain object
     * @param data - Plain object data
     * @returns New UserConfiguration instance
     */
    public static fromJSON(data: any): UserConfiguration {
        return new UserConfiguration({
            token: data.token || '',
            idSite: data.id_site || data.idSite || '',
            password: data.password || '',
            idDevice: data.id_device || data.idDevice || '',
            pin: data.pin || '',
            deviceName: data.deviceName || ''
        });
    }
}