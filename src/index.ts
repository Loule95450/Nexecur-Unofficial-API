/**
 * Nexecur Unofficial API
 * Main entry point for the library
 */

// Main API class
export { NexecurAPI } from './controllers/NexecurAPI';

// Models and types
export { AlarmStatus, alarmStatusToString, isValidAlarmStatus } from './models/AlarmStatus';
export { UserConfiguration } from './models/UserConfiguration';
export { NexecurConfiguration } from './models/NexecurConfiguration';

// Error classes
export {
    NexecurError,
    SaltGenerationError,
    TokenGenerationError,
    RegisteringDeviceError,
    OrderAlarmError,
    UndefinedApiError,
    StillPendingError
} from './models/errors/NexecurErrors';

// Interfaces
export { IUserConfiguration } from './interfaces/IUserConfiguration';
export { 
    IApiResponse, 
    ISaltResponse, 
    ISiteResponse, 
    IRegisterResponse, 
    IPanelStatusResponse, 
    IPanelCheckResponse 
} from './interfaces/IApiResponses';

// Utilities
export { Utils } from './helpers/Utils';
export { EncryptionKeys } from './helpers/EncryptionKeys';

// Services (for advanced usage)
export { RequestService } from './controllers/RequestService';