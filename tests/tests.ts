import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { NexecurAPI } from '../src/controllers/NexecurAPI';
import { UserConfiguration } from '../src/models/UserConfiguration';
import { AlarmStatus } from '../src/models/AlarmStatus';
import { RequestService } from '../src/controllers/RequestService';
import { 
    OrderAlarmError,
    UndefinedApiError 
} from '../src/models/errors/NexecurErrors';

/**
 * Mock responses for testing
 */
const mockResponses = {
    saltSuccess: {
        message: 'OK',
        status: 0,
        salt: 'dGVzdFNhbHQ='
    },
    siteSuccess: {
        message: 'OK',
        status: 0,
        token: 'test-token-123',
        panel_status: AlarmStatus.Disabled,
        evenements: [
            { timestamp: '2023-01-01T10:00:00Z', type: 'alarm_disabled' }
        ]
    },
    registerSuccess: {
        message: '',
        status: 0,
        id_device: 'device-123'
    },
    panelStatusSuccess: {
        message: 'OK',
        status: 0,
        pending: 0
    },
    panelCheckSuccess: {
        message: 'OK',
        status: 0,
        still_pending: 0
    }
};

/**
 * Test configuration
 */
const testConfig = new UserConfiguration({
    token: 'test-token',
    idSite: 'test-site-123',
    password: 'test-password',
    idDevice: 'test-device',
    pin: 'test-pin',
    deviceName: 'Test Device'
});

describe('NexecurAPI', () => {
    beforeEach(() => {
        // Set up test configuration
        NexecurAPI.setUserConfiguration(testConfig.clone());
    });

    afterEach(() => {
        // Reset configuration after each test
        NexecurAPI.resetUserConfiguration();
    });

    describe('getAlarmStatus', () => {
        it('should return alarm status successfully', async () => {
            // Mock the authenticateWithSite method
            const originalAuth = RequestService.authenticateWithSite;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;

            try {
                const status = await NexecurAPI.getAlarmStatus();
                expect(status).to.equal(AlarmStatus.Disabled);
            } finally {
                RequestService.authenticateWithSite = originalAuth;
            }
        });

        it('should throw UndefinedApiError when API returns error', async () => {
            // Mock the authenticateWithSite method to return error
            const originalAuth = RequestService.authenticateWithSite;
            RequestService.authenticateWithSite = async () => ({
                message: 'ERROR',
                status: 1,
                token: '',
                panel_status: 0,
                evenements: []
            });

            try {
                await NexecurAPI.getAlarmStatus();
                expect.fail('Should have thrown UndefinedApiError');
            } catch (error) {
                expect(error).to.be.instanceOf(UndefinedApiError);
            } finally {
                RequestService.authenticateWithSite = originalAuth;
            }
        });

        it('should handle invalid configuration', async () => {
            // Set invalid configuration
            const invalidConfig = new UserConfiguration({
                idSite: '', // Missing required field
                password: 'test'
            });
            NexecurAPI.setUserConfiguration(invalidConfig);

            try {
                await NexecurAPI.getAlarmStatus();
                expect.fail('Should have thrown error for invalid configuration');
            } catch (error) {
                expect(error.message).to.include('Invalid configuration');
            }
        });
    });

    describe('getEventHistory', () => {
        it('should return event history successfully', async () => {
            // Mock the authenticateWithSite method
            const originalAuth = RequestService.authenticateWithSite;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;

            try {
                const events = await NexecurAPI.getEventHistory();
                expect(events).to.be.an('array');
                expect(events).to.have.length(1);
                expect(events[0]).to.have.property('timestamp');
            } finally {
                RequestService.authenticateWithSite = originalAuth;
            }
        });

        it('should return empty array when no events available', async () => {
            // Mock the authenticateWithSite method with no events
            const originalAuth = RequestService.authenticateWithSite;
            RequestService.authenticateWithSite = async () => ({
                ...mockResponses.siteSuccess,
                evenements: []
            });

            try {
                const events = await NexecurAPI.getEventHistory();
                expect(events).to.be.an('array');
                expect(events).to.have.length(0);
            } finally {
                RequestService.authenticateWithSite = originalAuth;
            }
        });
    });

    describe('enableAlarm', () => {
        it('should enable alarm successfully when operation completes immediately', async () => {
            // Mock required methods
            const originalControl = RequestService.controlPanelStatus;
            RequestService.controlPanelStatus = async () => mockResponses.panelStatusSuccess;

            try {
                await NexecurAPI.enableAlarm();
                // If no error is thrown, the test passes
            } finally {
                RequestService.controlPanelStatus = originalControl;
            }
        });

        it('should handle pending operations correctly', async () => {
            // Mock control method to return pending, then wait method to succeed
            const originalControl = RequestService.controlPanelStatus;
            const originalWait = RequestService.waitForPanelStatusChange;
            
            RequestService.controlPanelStatus = async () => ({
                ...mockResponses.panelStatusSuccess,
                pending: 1
            });
            RequestService.waitForPanelStatusChange = async () => mockResponses.panelCheckSuccess;

            try {
                await NexecurAPI.enableAlarm();
                // If no error is thrown, the test passes
            } finally {
                RequestService.controlPanelStatus = originalControl;
                RequestService.waitForPanelStatusChange = originalWait;
            }
        });

        it('should throw OrderAlarmError when panel status returns error', async () => {
            // Mock control method to return error
            const originalControl = RequestService.controlPanelStatus;
            RequestService.controlPanelStatus = async () => ({
                message: 'ERROR',
                status: 1,
                pending: 0
            });

            try {
                await NexecurAPI.enableAlarm();
                expect.fail('Should have thrown OrderAlarmError');
            } catch (error) {
                expect(error).to.be.instanceOf(OrderAlarmError);
                expect(error.message).to.include('enabling alarm');
            } finally {
                RequestService.controlPanelStatus = originalControl;
            }
        });
    });

    describe('disableAlarm', () => {
        it('should disable alarm successfully', async () => {
            // Mock required methods
            const originalControl = RequestService.controlPanelStatus;
            RequestService.controlPanelStatus = async () => mockResponses.panelStatusSuccess;

            try {
                await NexecurAPI.disableAlarm();
                // If no error is thrown, the test passes
            } finally {
                RequestService.controlPanelStatus = originalControl;
            }
        });

        it('should throw OrderAlarmError when operation fails', async () => {
            // Mock control method to return error
            const originalControl = RequestService.controlPanelStatus;
            RequestService.controlPanelStatus = async () => ({
                message: 'ERROR',
                status: 1,
                pending: 0
            });

            try {
                await NexecurAPI.disableAlarm();
                expect.fail('Should have thrown OrderAlarmError');
            } catch (error) {
                expect(error).to.be.instanceOf(OrderAlarmError);
                expect(error.message).to.include('disabling alarm');
            } finally {
                RequestService.controlPanelStatus = originalControl;
            }
        });
    });

    describe('device registration flow', () => {
        it('should handle device registration when not registered', async () => {
            // Set up unregistered configuration
            const unregisteredConfig = new UserConfiguration({
                token: '', // No token means not registered
                idSite: 'test-site',
                password: 'test-password',
                idDevice: '',
                pin: '',
                deviceName: 'Test Device'
            });
            NexecurAPI.setUserConfiguration(unregisteredConfig);

            // Mock all required methods for registration flow
            const originalSalt = RequestService.getSalt;
            const originalAuth = RequestService.authenticateWithSite;
            const originalRegister = RequestService.registerDevice;

            RequestService.getSalt = async () => mockResponses.saltSuccess;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;
            RequestService.registerDevice = async () => mockResponses.registerSuccess;

            try {
                const status = await NexecurAPI.getAlarmStatus();
                expect(status).to.equal(AlarmStatus.Disabled);
            } finally {
                RequestService.getSalt = originalSalt;
                RequestService.authenticateWithSite = originalAuth;
                RequestService.registerDevice = originalRegister;
            }
        });
    });
});