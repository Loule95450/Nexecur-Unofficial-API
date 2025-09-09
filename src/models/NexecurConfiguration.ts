import * as fs from 'fs';
import * as path from 'path';
import { UserConfiguration } from './UserConfiguration';
import { Utils } from '../helpers/Utils';

/**
 * Configuration management for Nexecur API endpoints and user settings
 */
export class NexecurConfiguration {
    /** Base URL for Nexecur API */
    public static readonly BASE_URL = 'https://monnexecur-prd.nexecur.fr';
    
    /** API endpoint for configuration */
    public static readonly CONFIG_URI = '/webservices/configuration';
    
    /** API endpoint for salt generation */
    public static readonly SALT_URI = '/webservices/salt';
    
    /** API endpoint for site authentication */
    public static readonly SITE_URI = '/webservices/site';
    
    /** API endpoint for device registration */
    public static readonly REGISTER_URI = '/webservices/register';
    
    /** API endpoint for panel status operations */
    public static readonly PANEL_STATUS_URI = '/webservices/panel-status';
    
    /** API endpoint for checking panel status */
    public static readonly PANEL_CHECK_STATUS_URI = '/webservices/check-panel-status';

    /** API endpoint for streaming (camera) */
    public static readonly STREAM_URI = '/webservices/stream';
    
    /** Maximum seconds to wait for alarm activation/deactivation */
    public static readonly MAX_WAIT_SECONDS_FOR_ALARM_OPERATION = 60;
    
    /** Default configuration file name */
    private static readonly DEFAULT_CONFIG_FILE = 'config.json';
    
    /** Path to the configuration file */
    private static configFilePath: string = path.join(__dirname, '../../', NexecurConfiguration.DEFAULT_CONFIG_FILE);

    /**
     * Sets the configuration file path
     * @param filePath - Path to the configuration file
     */
    public static setConfigFilePath(filePath: string): void {
        NexecurConfiguration.configFilePath = filePath;
    }

    /**
     * Gets the current configuration file path
     * @returns Configuration file path
     */
    public static getConfigFilePath(): string {
        return NexecurConfiguration.configFilePath;
    }

    /**
     * Loads user configuration from file
     * @returns UserConfiguration instance
     * @throws Error if file cannot be read or parsed
     */
    public static loadUserConfiguration(): UserConfiguration {
        try {
            const fileContent = fs.readFileSync(NexecurConfiguration.configFilePath, 'utf8');
            const configData = Utils.safeJsonParse(fileContent, {});
            return UserConfiguration.fromJSON(configData);
        } catch (error) {
            throw new Error(`Failed to load configuration from ${NexecurConfiguration.configFilePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Saves user configuration to file
     * @param userConfig - UserConfiguration to save
     * @throws Error if file cannot be written
     */
    public static saveUserConfiguration(userConfig: UserConfiguration): void {
        try {
            const configData = {
                token: userConfig.token,
                id_site: userConfig.idSite,
                password: userConfig.password,
                id_device: userConfig.idDevice,
                pin: userConfig.pin,
                deviceName: userConfig.deviceName
            };
            
            const jsonString = JSON.stringify(configData, null, 2);
            fs.writeFileSync(NexecurConfiguration.configFilePath, jsonString, 'utf8');
        } catch (error) {
            throw new Error(`Failed to save configuration to ${NexecurConfiguration.configFilePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Updates the authentication token in the configuration
     * @param token - New authentication token
     * @param userConfig - UserConfiguration instance to update
     */
    public static updateToken(token: string, userConfig: UserConfiguration): void {
        userConfig.token = token;
        NexecurConfiguration.saveUserConfiguration(userConfig);
    }

    /**
     * Updates the PIN hash in the configuration
     * @param pinHash - New PIN hash
     * @param userConfig - UserConfiguration instance to update
     */
    public static updatePinHash(pinHash: string, userConfig: UserConfiguration): void {
        userConfig.pin = pinHash;
        NexecurConfiguration.saveUserConfiguration(userConfig);
    }

    /**
     * Updates the password hash in the configuration
     * @param passwordHash - New password hash
     * @param userConfig - UserConfiguration instance to update
     */
    public static updatePasswordHash(passwordHash: string, userConfig: UserConfiguration): void {
        userConfig.password = passwordHash;
        NexecurConfiguration.saveUserConfiguration(userConfig);
    }

    /**
     * Updates the device ID in the configuration
     * @param deviceId - New device ID
     * @param userConfig - UserConfiguration instance to update
     */
    public static updateDeviceId(deviceId: string, userConfig: UserConfiguration): void {
        userConfig.idDevice = deviceId;
        NexecurConfiguration.saveUserConfiguration(userConfig);
    }

    /**
     * Checks if the configuration file exists
     * @returns True if configuration file exists
     */
    public static configFileExists(): boolean {
        return fs.existsSync(NexecurConfiguration.configFilePath);
    }

    /**
     * Creates a default configuration file if it doesn't exist
     */
    public static createDefaultConfigIfNotExists(): void {
        if (!NexecurConfiguration.configFileExists()) {
            const defaultConfig = new UserConfiguration();
            NexecurConfiguration.saveUserConfiguration(defaultConfig);
        }
    }
}