import * as request from 'request';
import { NexecurConfiguration } from '../models/NexecurConfiguration';
import { UserConfiguration } from '../models/UserConfiguration';
import { Utils } from '../helpers/Utils';
import { StillPendingError } from '../models/errors/NexecurErrors';
import { 
    IApiResponse, 
    ISaltResponse, 
    ISiteResponse, 
    IRegisterResponse, 
    IPanelStatusResponse, 
    IPanelCheckResponse,
    IStreamResponse
} from '../interfaces/IApiResponses';
import { IRequestOptions } from '../interfaces/IRequestOptions';

/**
 * Handles HTTP requests to the Nexecur API
 */
export class RequestService {
    private static readonly DEFAULT_HEADERS = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    /**
     * Makes a POST request to the Nexecur API
     * @param options - Request options
     * @returns Promise with the response data
     */
    private static makePostRequest<T = IApiResponse>(options: IRequestOptions): Promise<T> {
        return new Promise((resolve, reject) => {
            request.post(options, (error, _httpResponse, body) => {
                if (error) {
                    reject(new Error(`HTTP request failed: ${error.message}`));
                    return;
                }
                
                resolve(body as T);
            });
        });
    }

    /**
     * Gets configuration from the Nexecur API
     * @returns Promise with configuration response
     */
    public static async getConfiguration(): Promise<IApiResponse> {
        const requestOptions: IRequestOptions = {
            url: NexecurConfiguration.BASE_URL + NexecurConfiguration.CONFIG_URI,
            headers: {
                ...RequestService.DEFAULT_HEADERS,
                'X-Auth-Token': ''
            },
            json: {
                os: 'android'
            }
        };

        return RequestService.makePostRequest<IApiResponse>(requestOptions);
    }

    /**
     * Requests a salt value for password hashing
     * @param userConfig - User configuration
     * @returns Promise with salt response
     */
    public static async getSalt(userConfig: UserConfiguration): Promise<ISaltResponse> {
        const requestOptions: IRequestOptions = {
            url: NexecurConfiguration.BASE_URL + NexecurConfiguration.SALT_URI,
            headers: {
                ...RequestService.DEFAULT_HEADERS,
                'X-Auth-Token': ''
            },
            json: {
                id_site: userConfig.idSite,
                password: userConfig.password,
                id_device: userConfig.idDevice,
                partage: '1',
                pin: userConfig.pin
            }
        };

        return RequestService.makePostRequest<ISaltResponse>(requestOptions);
    }

    /**
     * Registers a new device with the Nexecur service
     * @param deviceName - Name for the device
     * @param userConfig - User configuration with authentication token
     * @returns Promise with registration response
     */
    public static async registerDevice(deviceName: string, userConfig: UserConfiguration): Promise<IRegisterResponse> {
        const requestOptions: IRequestOptions = {
            url: NexecurConfiguration.BASE_URL + NexecurConfiguration.REGISTER_URI,
            headers: {
                ...RequestService.DEFAULT_HEADERS,
                'X-Auth-Token': userConfig.token
            },
            json: {
                alert: 'enabled',
                appname: 'Mon+Nexecur',
                nom: '',
                badge: 'enabled',
                options: [1],
                sound: 'enabled',
                id_device: userConfig.idDevice,
                actif: 1,
                plateforme: 'gcm',
                app_version: '1.15 (30)',
                device_model: 'SM-G315F',
                device_name: deviceName,
                device_version: '7.0'
            }
        };

        return RequestService.makePostRequest<IRegisterResponse>(requestOptions);
    }

    /**
     * Authenticates with the site and gets alarm status
     * @param userConfig - User configuration
     * @returns Promise with site response containing alarm status and events
     */
    public static async authenticateWithSite(userConfig: UserConfiguration): Promise<ISiteResponse> {
        const requestOptions: IRequestOptions = {
            url: NexecurConfiguration.BASE_URL + NexecurConfiguration.SITE_URI,
            headers: {
                ...RequestService.DEFAULT_HEADERS,
                'X-Auth-Token': userConfig.token
            },
            json: {
                id_site: userConfig.idSite,
                password: userConfig.password,
                id_device: userConfig.idDevice,
                partage: '1',
                pin: userConfig.pin
            }
        };

        const response = await RequestService.makePostRequest<ISiteResponse>(requestOptions);
        
        // Update token if present in response
        if (response.token) {
            NexecurConfiguration.updateToken(response.token, userConfig);
        }
        
        return response;
    }

    /**
     * Controls the alarm panel status (arm/disarm)
     * @param userConfig - User configuration
     * @param alarmCommand - Alarm command (0 = disarm, 1 = arm, -1 = status only)
     * @returns Promise with panel status response
     */
    public static async controlPanelStatus(userConfig: UserConfiguration, alarmCommand: number = -1): Promise<IPanelStatusResponse> {
        const requestOptions: IRequestOptions = {
            url: NexecurConfiguration.BASE_URL + NexecurConfiguration.PANEL_STATUS_URI,
            headers: {
                ...RequestService.DEFAULT_HEADERS,
                'X-Auth-Token': userConfig.token
            },
            json: {}
        };

        // Add alarm command if specified
        if (alarmCommand !== -1) {
            const action = alarmCommand === 0 ? 'Disarming' : alarmCommand === 1 ? 'Arming (Partial - SP1)' : 'Arming (Total - SP2)';
            console.log(`${action} alarm system`);
            requestOptions.json = {
                status: alarmCommand
            };
        }

        return RequestService.makePostRequest<IPanelStatusResponse>(requestOptions);
    }

    /**
     * Checks the panel status until operation completes or timeout
     * @param userConfig - User configuration
     * @param maxWaitSeconds - Maximum seconds to wait
     * @returns Promise that resolves when operation completes
     * @throws StillPendingError if operation doesn't complete within timeout
     */
    public static async waitForPanelStatusChange(
        userConfig: UserConfiguration, 
        maxWaitSeconds: number = NexecurConfiguration.MAX_WAIT_SECONDS_FOR_ALARM_OPERATION
    ): Promise<IPanelCheckResponse> {
        const startTime = Date.now();
        const maxWaitMs = maxWaitSeconds * 1000;
        let attemptCount = 0;

        while (Date.now() - startTime < maxWaitMs) {
            attemptCount++;
            
            const requestOptions: IRequestOptions = {
                url: NexecurConfiguration.BASE_URL + NexecurConfiguration.PANEL_CHECK_STATUS_URI,
                headers: {
                    ...RequestService.DEFAULT_HEADERS,
                    'X-Auth-Token': userConfig.token
                },
                json: {}
            };

            const response = await RequestService.makePostRequest<IPanelCheckResponse>(requestOptions);
            
            // If operation is complete, return success
            if (response.still_pending === 0) {
                return response;
            }

            // Wait before next check (2 seconds with exponential backoff for failed attempts)
            const waitTime = 2000 + (attemptCount > 5 ? (attemptCount - 5) * 1000 : 0);
            await Utils.sleep(waitTime);
        }

        throw new StillPendingError(
            `The alarm operation did not complete within ${maxWaitSeconds} seconds after ${attemptCount} attempts.`
        );
    }

    /**
     * Requests a stream (camera) data for a given device serial
     * @param userConfig - User configuration with valid token
     * @param deviceSerial - Device serial as provided in site devices
     * @returns Promise with stream response
     */
    public static async getStream(userConfig: UserConfiguration, deviceSerial: string): Promise<IStreamResponse> {
        const requestOptions: IRequestOptions = {
            url: NexecurConfiguration.BASE_URL + NexecurConfiguration.STREAM_URI,
            headers: {
                ...RequestService.DEFAULT_HEADERS,
                'X-Auth-Token': userConfig.token
            },
            json: {
                serial: deviceSerial
            }
        };

        return RequestService.makePostRequest<IStreamResponse>(requestOptions);
    }
}