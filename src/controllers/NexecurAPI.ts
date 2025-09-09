import { UserConfiguration } from '../models/UserConfiguration';
import { NexecurConfiguration } from '../models/NexecurConfiguration';
import { RequestService } from './RequestService';
import { AlarmStatus } from '../models/AlarmStatus';
import { EncryptionKeys } from '../helpers/EncryptionKeys';
import { 
    SaltGenerationError, 
    TokenGenerationError, 
    RegisteringDeviceError, 
    OrderAlarmError, 
    UndefinedApiError 
} from '../models/errors/NexecurErrors';
import { IEvenement, IStreamResponse } from '../interfaces/IApiResponses';

/**
 * Main API class for interacting with the Nexecur alarm system
 */
export class NexecurAPI {
    private static userConfiguration: UserConfiguration | null = null;

    /**
     * Gets the current user configuration, loading from file if needed
     * @returns UserConfiguration instance
     */
    private static getUserConfiguration(): UserConfiguration {
        if (!NexecurAPI.userConfiguration) {
            NexecurAPI.userConfiguration = NexecurConfiguration.loadUserConfiguration();
        }
        return NexecurAPI.userConfiguration;
    }

    /**
     * Requests stream data for a specified device serial and returns raw response
     * @param deviceSerial - Serial from site devices
     */
    public static async getStream(deviceSerial: string): Promise<IStreamResponse> {
        const userConfig = NexecurAPI.getUserConfiguration();
        NexecurAPI.validateConfiguration(userConfig);

        await NexecurAPI.ensureDeviceRegistration(userConfig);

        try {
            const streamResponse = await RequestService.getStream(userConfig, deviceSerial);
            if (streamResponse.message !== 'OK' && streamResponse.status !== 0) {
                throw new UndefinedApiError('Failed to retrieve stream data from API');
            }

            return streamResponse;
        } catch (error) {
            if (error instanceof UndefinedApiError) {
                throw error;
            }
            throw new UndefinedApiError(`Failed to get stream data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Validates user configuration and ensures required fields are present
     * @param userConfig - User configuration to validate
     * @throws Error if configuration is invalid
     */
    private static validateConfiguration(userConfig: UserConfiguration): void {
        if (!userConfig.isValid()) {
            throw new Error('Invalid configuration: id_site and password are required');
        }
    }

    /**
     * Ensures device is registered, registering a new one if needed
     * @param userConfig - User configuration
     */
    private static async ensureDeviceRegistration(userConfig: UserConfiguration): Promise<void> {
        if (!userConfig.isDeviceRegistered()) {
            await NexecurAPI.registerNewDevice(userConfig);
        }
    }

    /**
     * Registers a new device for controlling the alarm
     * @param userConfig - User configuration
     */
    private static async registerNewDevice(userConfig: UserConfiguration): Promise<void> {
        try {
            // Step 1: Get salt for password hashing
            const saltResponse = await RequestService.getSalt(userConfig);
            
            if (saltResponse.message !== 'OK' || saltResponse.status !== 0) {
                throw new SaltGenerationError('Failed to retrieve salt for device registration');
            }

            // Step 2: Generate encrypted credentials
            const encryptionKeys = new EncryptionKeys(userConfig.password, saltResponse.salt);
            encryptionKeys.generateKeys();

            // Step 3: Update configuration with hashed credentials
            NexecurConfiguration.updatePasswordHash(encryptionKeys.passwordHash, userConfig);
            NexecurConfiguration.updatePinHash(encryptionKeys.pinHash, userConfig);

            // Step 4: Authenticate to get token
            const siteResponse = await RequestService.authenticateWithSite(userConfig);
            
            if (siteResponse.message !== 'OK' || siteResponse.status !== 0) {
                throw new TokenGenerationError('Failed to obtain authentication token');
            }

            // Step 5: Register the device
            const deviceName = userConfig.deviceName || 'Nexecur API Device';
            const registrationResponse = await RequestService.registerDevice(deviceName, userConfig);
            
            if (registrationResponse.message !== '' || registrationResponse.status !== 0) {
                throw new RegisteringDeviceError('Failed to register device with the service');
            }

            // Step 6: Update configuration with device ID
            NexecurConfiguration.updateDeviceId(registrationResponse.id_device, userConfig);

        } catch (error) {
            if (error instanceof SaltGenerationError || 
                error instanceof TokenGenerationError || 
                error instanceof RegisteringDeviceError) {
                throw error;
            }
            throw new RegisteringDeviceError(`Device registration failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Controls the alarm system (enable/disable)
     * @param alarmCommand - Alarm command (1 = enable, 0 = disable)
     * @returns Promise that resolves when operation completes
     */
    private static async controlAlarmSystem(alarmCommand: number): Promise<void> {
        const userConfig = NexecurAPI.getUserConfiguration();
        NexecurAPI.validateConfiguration(userConfig);
        
        await NexecurAPI.ensureDeviceRegistration(userConfig);

        try {
            // Send alarm control command
            const statusResponse = await RequestService.controlPanelStatus(userConfig, alarmCommand);
            
            if (statusResponse.message !== 'OK' || statusResponse.status !== 0) {
                const action = alarmCommand === 0 ? 'disabling' : alarmCommand === 1 ? 'enabling partial' : 'enabling total';
                throw new OrderAlarmError(`Error while ${action} alarm system`);
            }

            // Check if operation completed immediately
            if (statusResponse.pending === 0) {
                return; // Operation completed immediately
            }

            // Wait for operation to complete
            await RequestService.waitForPanelStatusChange(userConfig);
            
        } catch (error) {
            if (error instanceof OrderAlarmError) {
                throw error;
            }
            const action = alarmCommand === 0 ? 'disabling' : alarmCommand === 1 ? 'enabling partial' : 'enabling total';
            throw new OrderAlarmError(`Failed ${action} alarm: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Enables the alarm system in partial mode (SP1)
     * @returns Promise that resolves when partial alarm is enabled
     */
    public static async enablePartialAlarm(): Promise<void> {
        return NexecurAPI.controlAlarmSystem(1);
    }

    /**
     * Enables the alarm system in total mode (SP2)
     * @returns Promise that resolves when total alarm is enabled
     */
    public static async enableTotalAlarm(): Promise<void> {
        return NexecurAPI.controlAlarmSystem(2);
    }

    /**
     * Enables the alarm system (defaults to total alarm for backward compatibility)
     * @deprecated Use enablePartialAlarm() or enableTotalAlarm() for explicit control
     * @returns Promise that resolves when alarm is enabled
     */
    public static async enableAlarm(): Promise<void> {
        return NexecurAPI.controlAlarmSystem(1); // Default to partial alarm
    }

    /**
     * Disables the alarm system
     * @returns Promise that resolves when alarm is disabled
     */
    public static async disableAlarm(): Promise<void> {
        return NexecurAPI.controlAlarmSystem(0);
    }

    /**
     * Gets the current alarm system status
     * @returns Promise with current alarm status
     */
    public static async getAlarmStatus(): Promise<AlarmStatus> {
        const userConfig = NexecurAPI.getUserConfiguration();
        NexecurAPI.validateConfiguration(userConfig);
        
        await NexecurAPI.ensureDeviceRegistration(userConfig);

        try {
            const siteResponse = await RequestService.authenticateWithSite(userConfig);
            
            if (siteResponse.message !== 'OK' || siteResponse.status !== 0) {
                throw new UndefinedApiError('Failed to retrieve alarm status from API');
            }

            return siteResponse.panel_status as AlarmStatus;
            
        } catch (error) {
            if (error instanceof UndefinedApiError) {
                throw error;
            }
            throw new UndefinedApiError(`Failed to get alarm status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Gets the alarm system event history
     * @returns Promise with event history array
     */
    public static async getEventHistory(): Promise<IEvenement[]> {
        const userConfig = NexecurAPI.getUserConfiguration();
        NexecurAPI.validateConfiguration(userConfig);
        
        await NexecurAPI.ensureDeviceRegistration(userConfig);

        try {
            const siteResponse = await RequestService.authenticateWithSite(userConfig);
            
            if (siteResponse.message !== 'OK' || siteResponse.status !== 0) {
                throw new UndefinedApiError('Failed to retrieve event history from API');
            }

            return siteResponse.evenements || [];
            
        } catch (error) {
            if (error instanceof UndefinedApiError) {
                throw error;
            }
            throw new UndefinedApiError(`Failed to get event history: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Sets a custom user configuration (useful for testing)
     * @param config - User configuration to use
     */
    public static setUserConfiguration(config: UserConfiguration): void {
        NexecurAPI.userConfiguration = config;
    }

    /**
     * Resets the cached user configuration, forcing reload from file
     */
    public static resetUserConfiguration(): void {
        NexecurAPI.userConfiguration = null;
    }
}
