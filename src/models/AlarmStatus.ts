/**
 * Enumeration of possible alarm system states
 */
export enum AlarmStatus {
    /** Alarm system is disabled/disarmed */
    Disabled = 0,
    
    /** Alarm system is enabled/armed */
    Enabled = 1
}

/**
 * Type guard to check if a value is a valid AlarmStatus
 * @param value - Value to check
 * @returns True if value is a valid AlarmStatus
 */
export function isValidAlarmStatus(value: any): value is AlarmStatus {
    return Object.values(AlarmStatus).includes(value);
}

/**
 * Convert alarm status to human-readable string
 * @param status - Alarm status to convert
 * @returns Human-readable status string
 */
export function alarmStatusToString(status: AlarmStatus): string {
    switch (status) {
        case AlarmStatus.Disabled:
            return 'Disabled';
        case AlarmStatus.Enabled:
            return 'Enabled';
        default:
            return 'Unknown';
    }
}