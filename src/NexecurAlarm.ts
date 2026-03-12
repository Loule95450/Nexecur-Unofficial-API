/**
 * Alarm version types
 */
export enum AlarmVersion {
    /** Videofied - Original Nexecur API (monnexecur-prd.nexecur.fr) */
    VIDEOFIED = 'videofied',
    
    /** Hikvision AX PRO - New version via GuardingVision Cloud */
    HIKVISION = 'hikvision'
}

/**
 * Configuration for either version
 */
export interface AlarmConfig {
    version: AlarmVersion;
    
    // Videofied config
    idSite?: string;
    password?: string;
    deviceName?: string;
    
    // Hikvision config
    phone?: string;
    email?: string;
    countryCode?: string;
    ssid?: string;
}

/**
 * Unified alarm client that supports both Videofied and Hikvision versions
 */
export class NexecurAlarmClient {
    private version: AlarmVersion;
    private hikvisionConfig: IHikvisionConfig | null = null;
    private _videofiedConfig: { idSite: string; password: string; deviceName: string } | null = null;

    constructor(config: AlarmConfig) {
        this.version = config.version;
        
        if (this.version === AlarmVersion.VIDEOFIED) {
            if (!config.idSite || !config.password) {
                throw new Error('idSite and password are required for Videofied version');
            }
            this._videofiedConfig = {
                idSite: config.idSite,
                password: config.password,
                deviceName: config.deviceName || 'Nexecur API Device'
            };
        } else if (this.version === AlarmVersion.HIKVISION) {
            if (!config.password || (!config.phone && !config.email)) {
                throw new Error('password and (phone or email) are required for Hikvision version');
            }
            this.hikvisionConfig = {
                phone: config.phone,
                email: config.email,
                password: config.password,
                countryCode: config.countryCode || '33',
                ssid: config.ssid || '',
                deviceName: config.deviceName || 'Nexecur API Device'
            };
        }
    }

    /**
     * Get the alarm version
     */
    public getAlarmVersion(): AlarmVersion {
        return this.version;
    }

    /**
     * Get the current alarm status
     */
    public async getStatus(): Promise<any> {
        if (this.version === AlarmVersion.VIDEOFIED) {
            // Dynamic import to avoid circular dependencies
            const { NexecurAPI } = await import('./controllers/NexecurAPI');
            // Get status using the static API
            const status = await NexecurAPI.getAlarmStatus();
            return {
                status,
                panel_sp1_available: true,
                panel_sp2_available: true
            };
        } else {
            const { HikvisionClient } = await import('./controllers/HikvisionClient');
            const client = new HikvisionClient(this.hikvisionConfig!);
            return client.getStatus();
        }
    }

    /**
     * Arm the alarm in home/stay mode
     */
    public async setArmedHome(): Promise<void> {
        if (this.version === AlarmVersion.VIDEOFIED) {
            const { NexecurAPI } = await import('./controllers/NexecurAPI');
            await NexecurAPI.enablePartialAlarm();
        } else {
            const { HikvisionClient } = await import('./controllers/HikvisionClient');
            const client = new HikvisionClient(this.hikvisionConfig!);
            await client.setArmedHome();
        }
    }

    /**
     * Arm the alarm in away mode
     */
    public async setArmedAway(): Promise<void> {
        if (this.version === AlarmVersion.VIDEOFIED) {
            const { NexecurAPI } = await import('./controllers/NexecurAPI');
            await NexecurAPI.enableTotalAlarm();
        } else {
            const { HikvisionClient } = await import('./controllers/HikvisionClient');
            const client = new HikvisionClient(this.hikvisionConfig!);
            await client.setArmedAway();
        }
    }

    /**
     * Disarm the alarm
     */
    public async disarm(): Promise<void> {
        if (this.version === AlarmVersion.VIDEOFIED) {
            const { NexecurAPI } = await import('./controllers/NexecurAPI');
            await NexecurAPI.disableAlarm();
        } else {
            const { HikvisionClient } = await import('./controllers/HikvisionClient');
            const client = new HikvisionClient(this.hikvisionConfig!);
            await client.disarm();
        }
    }

    /**
     * Get stream URL for a camera
     */
    public async getStream(deviceSerial: string): Promise<string | null> {
        if (this.version === AlarmVersion.VIDEOFIED) {
            const { NexecurAPI } = await import('./controllers/NexecurAPI');
            const response = await NexecurAPI.getStream(deviceSerial);
            return response.uri || null;
        } else {
            const { HikvisionClient } = await import('./controllers/HikvisionClient');
            const client = new HikvisionClient(this.hikvisionConfig!);
            return client.getStream(deviceSerial);
        }
    }
}

// Re-export for convenience
export { NexecurAPI } from './controllers/NexecurAPI';
export { HikvisionClient } from './controllers/HikvisionClient';
export { AlarmStatus, alarmStatusToString } from './models/AlarmStatus';

// Import IHikvisionConfig for internal use
import { IHikvisionConfig } from './controllers/HikvisionClient';
