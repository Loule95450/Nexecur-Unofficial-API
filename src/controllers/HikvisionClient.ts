/**
 * Client for Hikvision/GuardingVision cloud API (Nexecur v2)
 * Ported from the Python implementation in HACS-Nexecur
 */
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { 
    OrderAlarmError, 
    UndefinedApiError,
    TokenGenerationError
} from '../models/errors/NexecurErrors';

export interface IHikvisionConfig {
    phone?: string;
    email?: string;
    password: string;
    countryCode: string;
    ssid: string;
    deviceName: string;
}

export interface IHikvisionDevice {
    deviceSerial: string;
    name: string;
    deviceId: number;
    picture: string;
    [key: string]: any;
}

export interface IHikvisionUserInfo {
    username: string;
    customno?: string;
    areaId?: number;
    [key: string]: any;
}

export interface IHikvisionSecurityInfo {
    nonce?: string;
    realm?: string;
    salt?: string;
    salt2?: string;
    auth_hash?: string;
}

export interface IHikvisionState {
    status: number; // 0 = disarmed, 1 = armed_home/stay, 2 = armed_away
    panel_sp1_available: boolean;
    panel_sp2_available: boolean;
    raw: any;
}

/**
 * Client for Hikvision/GuardingVision cloud API
 * Used for Nexecur alarm systems (new version - Hikvision AX PRO)
 */
export class HikvisionClient {
    private account: string;
    private password: string;
    private ssid: string;
    private countryCode: string;
    private sessionId: string = '';
    private userInfo: IHikvisionUserInfo = { username: '' };
    private securityInfo: IHikvisionSecurityInfo = {};
    private devices: IHikvisionDevice[] = [];
    private currentDeviceSerial: string = '';
    private baseUrl: string = 'https://apiieu.guardingvision.com';

    constructor(config: IHikvisionConfig) {
        this.password = config.password;
        this.ssid = config.ssid;
        this.countryCode = config.countryCode || '33';
        
        // Format account (phone or email)
        if (config.email) {
            this.account = config.email;
        } else if (config.phone) {
            // For French phone numbers, API expects: 33 + phone without leading 0
            const cleanPhone = config.phone.replace(/[\s\-\.]/g, '');
            this.account = `${this.countryCode}${cleanPhone}`;
        } else {
            throw new Error('Either phone or email must be provided');
        }
    }

    /**
     * Generate a unique feature code
     */
    private generateFeatureCode(): string {
        return crypto.createHash('md5').update(uuidv4()).digest('hex');
    }

    /**
     * Compute MD5 hash of a string
     */
    private md5(s: string): string {
        return crypto.createHash('md5').update(s).digest('hex');
    }

    /**
     * Get standard API headers
     */
    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Host': 'apiieu.guardingvision.com',
            'appId': 'Nexecur',
            'lang': 'fr-FR',
            'clientType': '1183', // iOS
            'User-Agent': 'HikConnect/1.0.2 (iPhone; iOS 26.2; Scale/3.00)',
            'clientVersion': '1.0.2.20250404',
            'ssid': this.ssid,
            'netType': 'WIFI',
            'Connection': 'keep-alive',
            'Accept-Language': 'fr-FR;q=1, io-FR;q=0.9',
            'featureCode': this.generateFeatureCode(),
            'osVersion': '26.2',
            'Accept': '*/*',
        };
        
        if (this.sessionId) {
            headers['sessionId'] = this.sessionId;
        }
        if (this.userInfo.customno) {
            headers['customno'] = this.userInfo.customno;
        }
        if (this.userInfo.areaId) {
            headers['areaId'] = String(this.userInfo.areaId);
        }
        
        return headers;
    }

    /**
     * Authenticate with the Hikvision cloud
     */
    public async login(): Promise<void> {
        const url = `${this.baseUrl}/v3/users/login/v2`;

        const data = {
            account: this.account,
            password: this.md5(this.password),
            featureCode: this.generateFeatureCode(),
            cuName: 'aVBob25l', // Base64 for "iPhone"
            pushExtJson: '{\n  "language" : "zh"\n}',
            pushRegisterJson: '[]',
            bizType: '',
            imageCode: '',
            latitude: '',
            longitude: '',
            redirect: '',
            smsCode: '',
            smsToken: '',
        };

        try {
            const response = await this.makeRequest(url, 'POST', data);
            
            const meta = response.meta || {};
            if (String(meta.code) !== '200') {
                throw new TokenGenerationError(`Login failed: ${meta.message || 'Unknown error'}`);
            }

            this.sessionId = response.loginSession?.sessionId || '';
            this.userInfo = response.loginUser || { username: '' };

            // Update base URL if redirected
            const loginArea = response.loginArea || {};
            if (loginArea.apiDomain) {
                let domain = loginArea.apiDomain;
                this.baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
            }

            // Fetch devices
            await this.fetchDevices();

        } catch (error) {
            if (error instanceof TokenGenerationError) {
                throw error;
            }
            throw new TokenGenerationError(`Login error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Make HTTP request to the API
     */
    private async makeRequest(url: string, method: string, data?: Record<string, any>): Promise<any> {
        const request = require('request');
        
        return new Promise((resolve: (value: any) => void, reject: (reason: any) => void) => {
            const options: Record<string, any> = {
                url,
                method,
                headers: this.getHeaders(),
            };

            if (method === 'POST') {
                options.form = data;
            } else if (method === 'GET') {
                options.qs = data;
            }

            request(options, (error: any, _httpResponse: any, body: any) => {
                if (error) {
                    reject(new Error(`HTTP request failed: ${error.message}`));
                    return;
                }
                
                try {
                    resolve(typeof body === 'string' ? JSON.parse(body) : body);
                } catch {
                    reject(new Error('Failed to parse response'));
                }
            });
        });
    }

    /**
     * Fetch the list of devices from the cloud
     */
    private async fetchDevices(): Promise<void> {
        const url = `${this.baseUrl}/v3/userdevices/v1/devices/pagelist`;
        const params = {
            groupId: -1,
            limit: 20,
            offset: 0,
            filter: 'CLOUD,TIME_PLAN,CONNECTION,SWITCH,STATUS,WIFI,STATUS_EXT,NODISTURB,P2P,TTS,KMS,HIDDNS',
        };

        try {
            const response = await this.makeRequest(url, 'GET', params);
            
            this.devices = response.deviceInfos || [];
            if (this.devices.length > 0) {
                this.currentDeviceSerial = this.devices[0].deviceSerial || '';
            }
        } catch (error) {
            throw new UndefinedApiError(`Failed to fetch devices: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Fetch security info (nonce, realm, salts) from the device
     */
    private async getSecurityInfo(): Promise<[string | undefined, string | undefined]> {
        const username = this.userInfo.username || this.account;
        const payload = {
            "GetUserInfoByType": {
                "mode": "userName",
                "UserNameMode": { "userName": username },
            }
        };

        const uri = "/ISAPI/Security/CloudUserManage/users/byType?format=json";
        
        const response = await this.sendIsapi("POST", uri, payload);

        const rawData = response.data || "";
        const meta = response.meta || {};
        
        if (meta.code == 200 && rawData) {
            // Parse the response
            let jsonBody = rawData;
            if (rawData.includes("HTTP/1.1 200 OK")) {
                const bodyMatch = rawData.match(/\r\n\r\n({.*})/s);
                jsonBody = bodyMatch ? bodyMatch[1] : rawData;
            }

            try {
                const dataObj = JSON.parse(jsonBody);
                const nonce = dataObj.nonce;
                const realm = dataObj.realm || "DVRNVRDVS";

                // Extract salts
                let salt: string | undefined;
                let salt2: string | undefined;
                let authHash: string | undefined;
                
                if (dataObj.List && dataObj.List.length > 0) {
                    const cum = dataObj.List[0].CloudUserManage || dataObj.List[0];
                    salt = cum.salt;
                    salt2 = cum.salt2;
                    authHash = cum.userNameSessionAuthInfo;
                }

                this.securityInfo = {
                    nonce,
                    realm,
                    salt,
                    salt2,
                    auth_hash: authHash,
                };

                return [nonce, realm];
            } catch (err) {
                console.error("Failed to parse security info JSON:", err);
            }
        }

        return [undefined, undefined];
    }

    /**
     * Calculate digest authentication header
     */
    private calculateDigestAuth(method: string, uri: string, nonce: string, realm: string): string {
        const username = this.userInfo.username || this.account;

        // Derive password using salts
        let authPassword = this.securityInfo.auth_hash;
        const salt1 = this.securityInfo.salt;
        const salt2 = this.securityInfo.salt2;

        if (!authPassword && salt1 && salt2) {
            // Compute salted hash
            const md5Pass = this.md5(this.password).toLowerCase();
            const h1Input = `${username}${salt1}${md5Pass}`;
            const h1 = crypto.createHash('sha256').update(h1Input).digest('hex').toLowerCase();

            const h2Input = `${username}${salt2}${h1}`;
            authPassword = crypto.createHash('sha256').update(h2Input).digest('hex').toLowerCase();
        }

        if (!authPassword) {
            authPassword = this.password;
        }

        // Standard Digest Authentication
        const ha1 = this.md5(`${username}:${realm}:${authPassword}`).toLowerCase();
        const ha2 = this.md5(`${method}:${uri}`).toLowerCase();
        const response = this.md5(`${ha1}:${nonce}:${ha2}`).toLowerCase();

        return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}", UserType="Operator"`;
    }

    /**
     * Send an ISAPI command through the cloud tunnel
     */
    private async sendIsapi(
        method: string,
        uri: string,
        payload: Record<string, any> | null = null,
        digestAuth?: string
    ): Promise<any> {
        const tunnelUrl = `${this.baseUrl}/v3/userdevices/v1/isapi`;

        let innerHeaders = `${method} ${uri} HTTP/1.1\r\n`;
        innerHeaders += "UserType: Operator\r\n";
        if (digestAuth) {
            innerHeaders += `Authorization: ${digestAuth}\r\n`;
        }
        innerHeaders += "\r\n";

        const innerBody = payload ? JSON.stringify(payload) : "";
        const apiData = innerHeaders + innerBody;

        const bodyParams = {
            deviceSerial: this.currentDeviceSerial,
            apiKey: "todo",
            apiData: apiData,
        };

        try {
            return await this.makeRequest(tunnelUrl, 'POST', bodyParams);
        } catch (err) {
            console.error("ISAPI tunnel error:", err);
            return { meta: { code: 500 }, data: "" };
        }
    }

    /**
     * Execute an authenticated ISAPI command
     */
    private async executeIsapiCommand(
        method: string,
        uri: string,
        payload: Record<string, any> | null = null
    ): Promise<[boolean, string]> {
        const [nonce, realm] = await this.getSecurityInfo();

        let authHeader: string | undefined;
        if (nonce && realm) {
            authHeader = this.calculateDigestAuth(method, uri, nonce, realm);
        }

        const response = await this.sendIsapi(method, uri, payload, authHeader);

        const rawResponse = response.data || "";
        let statusCode = 0;
        const match = rawResponse.match(/HTTP\/1\.1 (\d+)/);
        if (match) {
            statusCode = parseInt(match[1], 10);
        }

        if (statusCode in [200, 201, 204] && !rawResponse.includes("Unauthorized")) {
            return [true, rawResponse];
        }

        return [false, rawResponse];
    }

    /**
     * Get the current alarm status
     */
    public async getStatus(): Promise<IHikvisionState> {
        if (!this.sessionId) {
            await this.login();
        }

        if (!this.currentDeviceSerial) {
            return {
                status: 0,
                panel_sp1_available: true,
                panel_sp2_available: true,
                raw: { devices: this.devices }
            };
        }

        const payload = {
            "AlarmHostStatusCond": {
                "communiStatus": true,
                "subSys": true,
                "hostStatus": true,
                "battery": true,
            }
        };

        const [success, rawResponse] = await this.executeIsapiCommand(
            "POST",
            "/ISAPI/SecurityCP/status/host?format=json",
            payload
        );

        let status = 0; // Default: disarmed
        const rawData: any = { devices: this.devices };

        if (success) {
            try {
                const jsonMatch = rawResponse.match(/\r\n\r\n({.*})/s);
                if (jsonMatch) {
                    const statusData = JSON.parse(jsonMatch[1]);
                    rawData.status_response = statusData;

                    // Parse subsystem status
                    const subSysList = statusData.AlarmHostStatus?.SubSysList || [];
                    for (const subSys of subSysList) {
                        const armStatus = subSys.SubSys?.arming || "";
                        if (armStatus === "away") {
                            status = 2;
                            break;
                        } else if (armStatus === "stay") {
                            status = 1;
                            break;
                        } else if (armStatus === "disarm") {
                            status = 0;
                        }
                    }
                }
            } catch (err) {
                console.debug("Could not parse status response:", err);
            }
        }

        return {
            status,
            panel_sp1_available: true,
            panel_sp2_available: true,
            raw: rawData,
        };
    }

    /**
     * Arm the alarm in stay/home mode
     */
    public async setArmedHome(): Promise<void> {
        if (!this.sessionId) {
            await this.login();
        }

        if (!this.currentDeviceSerial) {
            throw new OrderAlarmError('No device available');
        }

        const payload = { "subSysArmList": [{ "armType": "stay", "operationMode": "all" }] };

        const [success, response] = await this.executeIsapiCommand(
            "POST",
            "/ISAPI/SecurityCP/ArmAndsystemFault?format=json",
            payload
        );

        if (!success) {
            throw new OrderAlarmError(`Failed to arm stay: ${response}`);
        }

        console.log('Alarm armed in stay mode');
    }

    /**
     * Arm the alarm in away mode
     */
    public async setArmedAway(): Promise<void> {
        if (!this.sessionId) {
            await this.login();
        }

        if (!this.currentDeviceSerial) {
            throw new OrderAlarmError('No device available');
        }

        const payload = { "subSysArmList": [{ "armType": "away", "operationMode": "all" }] };

        const [success, response] = await this.executeIsapiCommand(
            "POST",
            "/ISAPI/SecurityCP/ArmAndsystemFault?format=json",
            payload
        );

        if (!success) {
            throw new OrderAlarmError(`Failed to arm away: ${response}`);
        }

        console.log('Alarm armed in away mode');
    }

    /**
     * Disarm the alarm
     */
    public async disarm(): Promise<void> {
        if (!this.sessionId) {
            await this.login();
        }

        if (!this.currentDeviceSerial) {
            throw new OrderAlarmError('No device available');
        }

        const payload = { "SubSysList": [{ "SubSys": { "id": 1 } }] };

        const [success, response] = await this.executeIsapiCommand(
            "PUT",
            "/ISAPI/SecurityCP/control/disarm?format=json",
            payload
        );

        if (!success) {
            throw new OrderAlarmError(`Failed to disarm: ${response}`);
        }

        console.log('Alarm disarmed');
    }

    /**
     * Get stream URL for a camera
     */
    public async getStream(_deviceSerial: string): Promise<string | null> {
        console.log('Camera streaming not yet implemented for Hikvision');
        return null;
    }

    /**
     * Get the current device serial
     */
    public get idDevice(): string {
        return this.currentDeviceSerial;
    }

    /**
     * Get the session ID
     */
    public get token(): string {
        return this.sessionId;
    }

    /**
     * Get the list of devices
     */
    public get deviceList(): IHikvisionDevice[] {
        return this.devices;
    }
}
