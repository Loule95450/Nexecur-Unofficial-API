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
        id_site: 12345,
        type: 'centrale_w',
        ecosystem: 'test_ecosystem',
        panel_streaming: 1,
        panel_serial: 'PANEL123456',
        panel_status: AlarmStatus.Disabled,
        panel_sp1: 0,
        panel_sp2: 0,
        panel_sp1_nom: 'SP1',
        panel_sp2_nom: 'SP2',
        services: [1, 2, 3],
        devices: [
            { serial: 'DEV123', device_id: 1, name: 'Test Device', picture: '' }
        ],
        badges: [
            { id_badge: 1, name: 'Test Badge', alias: 'badge1', code: '1234' }
        ],
        evenements: [
            { 
                id_evenement: 1,
                option_id: 1,
                device: 'DEV123',
                message: 'alarm_disabled',
                picture: '',
                date: 1672574400,
                status: 0,
                badge: 1
            }
        ],
        serrures: [],
        camera_token: 'camera-token-123',
        camera_available: 1,
        panel_available: 1,
        streaming_available: 1,
        serrures_available: 0,
        looky_available: 0,
        cameras: [],
        partages: []
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
    },
    streamSuccess: {
        message: 'OK',
        status: 0,
        uri: 'rtsp://stream.example.com:554/test/stream'
    },
    streamError: {
        message: 'ERROR',
        status: 1,
        uri: ''
    }
};

/**
 * Helper function to create a complete site error response
 */
const createSiteErrorResponse = (message = 'ERROR', status = 1) => ({
    message,
    status,
    token: '',
    id_site: 0,
    type: '',
    ecosystem: '',
    panel_streaming: 0,
    panel_serial: '',
    panel_status: 0,
    panel_sp1: 0,
    panel_sp2: 0,
    panel_sp1_nom: '',
    panel_sp2_nom: '',
    services: [],
    devices: [],
    badges: [],
    evenements: [],
    serrures: [],
    camera_token: '',
    camera_available: 0,
    panel_available: 0,
    streaming_available: 0,
    serrures_available: 0,
    looky_available: 0,
    cameras: [],
    partages: []
});

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
            RequestService.authenticateWithSite = async () => createSiteErrorResponse();

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
                expect(events[0]).to.have.property('date');
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

    describe('getStream', () => {
        it('should return stream response successfully', async () => {
            // Mock required methods for device registration and stream request
            const originalSalt = RequestService.getSalt;
            const originalAuth = RequestService.authenticateWithSite;
            const originalRegister = RequestService.registerDevice;
            const originalGetStream = RequestService.getStream;

            RequestService.getSalt = async () => mockResponses.saltSuccess;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;
            RequestService.registerDevice = async () => mockResponses.registerSuccess;
            RequestService.getStream = async () => mockResponses.streamSuccess;

            try {
                const streamResponse = await NexecurAPI.getStream('DEV123');
                expect(streamResponse).to.be.an('object');
                expect(streamResponse).to.have.property('uri');
                expect(streamResponse.uri).to.equal('rtsp://stream.example.com:554/test/stream');
                expect(streamResponse.message).to.equal('OK');
                expect(streamResponse.status).to.equal(0);
            } finally {
                RequestService.getSalt = originalSalt;
                RequestService.authenticateWithSite = originalAuth;
                RequestService.registerDevice = originalRegister;
                RequestService.getStream = originalGetStream;
            }
        });

        it('should throw UndefinedApiError when API returns error status', async () => {
            // Mock required methods with stream error response
            const originalSalt = RequestService.getSalt;
            const originalAuth = RequestService.authenticateWithSite;
            const originalRegister = RequestService.registerDevice;
            const originalGetStream = RequestService.getStream;

            RequestService.getSalt = async () => mockResponses.saltSuccess;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;
            RequestService.registerDevice = async () => mockResponses.registerSuccess;
            RequestService.getStream = async () => mockResponses.streamError;

            try {
                await NexecurAPI.getStream('DEV123');
                expect.fail('Should have thrown UndefinedApiError');
            } catch (error) {
                expect(error).to.be.instanceOf(UndefinedApiError);
                expect(error.message).to.include('Failed to retrieve stream data from API');
            } finally {
                RequestService.getSalt = originalSalt;
                RequestService.authenticateWithSite = originalAuth;
                RequestService.registerDevice = originalRegister;
                RequestService.getStream = originalGetStream;
            }
        });

        it('should throw UndefinedApiError when API returns non-OK message', async () => {
            // Mock required methods with stream response having non-OK message
            const originalSalt = RequestService.getSalt;
            const originalAuth = RequestService.authenticateWithSite;
            const originalRegister = RequestService.registerDevice;
            const originalGetStream = RequestService.getStream;

            RequestService.getSalt = async () => mockResponses.saltSuccess;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;
            RequestService.registerDevice = async () => mockResponses.registerSuccess;
            RequestService.getStream = async () => ({
                message: 'DEVICE_NOT_FOUND',
                status: 1, // Non-zero status to trigger error
                uri: ''
            });

            try {
                await NexecurAPI.getStream('INVALID_DEVICE');
                expect.fail('Should have thrown UndefinedApiError');
            } catch (error) {
                expect(error).to.be.instanceOf(UndefinedApiError);
                expect(error.message).to.include('Failed to retrieve stream data from API');
            } finally {
                RequestService.getSalt = originalSalt;
                RequestService.authenticateWithSite = originalAuth;
                RequestService.registerDevice = originalRegister;
                RequestService.getStream = originalGetStream;
            }
        });

        it('should handle network or request errors', async () => {
            // Mock required methods with network error for stream request
            const originalSalt = RequestService.getSalt;
            const originalAuth = RequestService.authenticateWithSite;
            const originalRegister = RequestService.registerDevice;
            const originalGetStream = RequestService.getStream;

            RequestService.getSalt = async () => mockResponses.saltSuccess;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;
            RequestService.registerDevice = async () => mockResponses.registerSuccess;
            RequestService.getStream = async () => {
                throw new Error('Network timeout');
            };

            try {
                await NexecurAPI.getStream('DEV123');
                expect.fail('Should have thrown UndefinedApiError');
            } catch (error) {
                expect(error).to.be.instanceOf(UndefinedApiError);
                expect(error.message).to.include('Failed to get stream data');
                expect(error.message).to.include('Network timeout');
            } finally {
                RequestService.getSalt = originalSalt;
                RequestService.authenticateWithSite = originalAuth;
                RequestService.registerDevice = originalRegister;
                RequestService.getStream = originalGetStream;
            }
        });

        it('should handle device registration flow when not registered', async () => {
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
            const originalGetStream = RequestService.getStream;

            RequestService.getSalt = async () => mockResponses.saltSuccess;
            RequestService.authenticateWithSite = async () => mockResponses.siteSuccess;
            RequestService.registerDevice = async () => mockResponses.registerSuccess;
            RequestService.getStream = async () => mockResponses.streamSuccess;

            try {
                const streamResponse = await NexecurAPI.getStream('DEV123');
                expect(streamResponse).to.be.an('object');
                expect(streamResponse.uri).to.equal('rtsp://stream.example.com:554/test/stream');
            } finally {
                RequestService.getSalt = originalSalt;
                RequestService.authenticateWithSite = originalAuth;
                RequestService.registerDevice = originalRegister;
                RequestService.getStream = originalGetStream;
            }
        });

        it('should handle invalid configuration', async () => {
            // Set up invalid configuration
            const invalidConfig = new UserConfiguration({
                token: '',
                idSite: '', // Missing required field
                password: 'test-password',
                idDevice: '',
                pin: '',
                deviceName: 'Test Device'
            });
            NexecurAPI.setUserConfiguration(invalidConfig);

            try {
                await NexecurAPI.getStream('DEV123');
                expect.fail('Should have thrown error for invalid configuration');
            } catch (error) {
                expect(error.message).to.include('Invalid configuration');
                expect(error.message).to.include('id_site and password are required');
            }
        });
    });
});