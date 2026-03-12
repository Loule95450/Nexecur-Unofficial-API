/**
 * Enumeration of possible alarm system states
 * 
 * Note: Both Videofied and Hikvision use the same status values:
 * - 0 = Disarmed
 * - 1 = Armed Home/Stay (SP1 for Videofied)
 * - 2 = Armed Away (SP2 for Videofied)
 */
export enum AlarmStatus {
    /** Alarm system is disabled/disarmed */
    Disabled = 0,
    
    /** Alarm system is partially enabled/armed (SP1 for Videofied, Stay for Hikvision) */
    PartialAlarm = 1,
    
    /** Alarm system is fully enabled/armed (SP2 for Videofied, Away for Hikvision) */
    TotalAlarm = 2,
    
    /** @deprecated Use TotalAlarm instead. Backward compatibility alias for fully enabled alarm */
    Enabled = 2
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
        case AlarmStatus.PartialAlarm:
            return 'Partial Alarm (SP1)';
        case AlarmStatus.TotalAlarm:
        case AlarmStatus.Enabled: // Handle deprecated alias
            return 'Total Alarm (SP2)';
        default:
            return 'Unknown';
    }
}