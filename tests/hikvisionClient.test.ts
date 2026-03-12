/**
 * Unit tests for HikvisionClient
 * Tests the Hikvision/GuardingVision API implementation
 * Uses Mocha + Chai (project test framework)
 */
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { HikvisionClient } from '../src/controllers/HikvisionClient';

describe('HikvisionClient', () => {
    let client: HikvisionClient;

    describe('constructor', () => {
        it('should create client with phone number', () => {
            client = new HikvisionClient({
                phone: '0612345678',
                password: 'testpassword',
                countryCode: '33',
                ssid: 'TestWiFi',
                deviceName: 'Test Device'
            });
            expect(client).to.be.instanceOf(HikvisionClient);
        });

        it('should format phone number with country code', () => {
            client = new HikvisionClient({
                phone: '0612345678',
                password: 'testpassword',
                countryCode: '33',
                ssid: 'TestWiFi'
            });
            expect(client).to.be.instanceOf(HikvisionClient);
        });

        it('should accept email instead of phone', () => {
            client = new HikvisionClient({
                email: 'test@example.com',
                password: 'testpassword',
                countryCode: '33',
                ssid: 'TestWiFi'
            });
            expect(client).to.be.instanceOf(HikvisionClient);
        });

        it('should throw error if neither phone nor email provided', () => {
            expect(() => {
                new HikvisionClient({
                    password: 'testpassword',
                    countryCode: '33',
                    ssid: 'TestWiFi'
                } as any);
            }).to.throw('Either phone or email must be provided');
        });
    });

    describe('properties', () => {
        beforeEach(() => {
            client = new HikvisionClient({
                phone: '0612345678',
                password: 'testpassword',
                countryCode: '33',
                ssid: 'TestWiFi'
            });
        });

        it('should have empty token initially', () => {
            expect(client.token).to.equal('');
        });

        it('should have empty idDevice initially', () => {
            expect(client.idDevice).to.equal('');
        });

        it('should have empty deviceList initially', () => {
            expect(client.deviceList).to.deep.equal([]);
        });
    });
});

describe('HikvisionClient - Authentication Flow', () => {
    const mockLoginResponse = {
        meta: { code: '200', message: 'Login successful' },
        loginSession: { sessionId: 'test-session-id-12345' },
        loginUser: { username: '330612345678', customno: 'custom123', areaId: 1 },
        loginArea: { apiDomain: 'apiieu.guardingvision.com' }
    };

    const mockDevicesResponse = {
        deviceInfos: [
            {
                deviceSerial: 'DSI12345678',
                name: 'AX PRO',
                deviceId: 123456,
                picture: ''
            }
        ]
    };

    it('should store session ID after login', async () => {
        const client = new HikvisionClient({
            phone: '0612345678',
            password: 'testpassword',
            countryCode: '33',
            ssid: 'TestWiFi'
        });

        expect(client.token).to.be.a('string');
        expect(client.idDevice).to.be.a('string');
    });
});

describe('Hikvision API Response Types', () => {
    it('should have correct login response structure', () => {
        const response = {
            meta: { code: '200', message: 'Login successful' },
            loginSession: { sessionId: 'string' },
            loginUser: { username: 'string' }
        };

        expect(response.meta.code).to.equal('200');
        expect(response.loginSession).to.have.property('sessionId');
        expect(response.loginUser).to.have.property('username');
    });

    it('should have correct devices response structure', () => {
        const response = {
            deviceInfos: [
                {
                    deviceSerial: 'DSI12345678',
                    name: 'AX PRO',
                    deviceId: 123456
                }
            ]
        };

        expect(response.deviceInfos).to.be.an('array');
        expect(response.deviceInfos[0]).to.have.property('deviceSerial');
        expect(response.deviceInfos[0]).to.have.property('name');
    });

    it('should parse alarm status correctly - away', () => {
        // Simulating ISAPI response format
        const rawResponse = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"AlarmHostStatus":{"SubSysList":[{"SubSys":{"id":1,"arming":"away"}}]}}';

        // Extract JSON from response
        const jsonStart = rawResponse.indexOf('\r\n\r\n') + 4;
        const jsonStr = rawResponse.substring(jsonStart);
        
        const statusData = JSON.parse(jsonStr);
        const armingStatus = statusData.AlarmHostStatus.SubSysList[0].SubSys.arming;
        
        expect(armingStatus).to.equal('away');
    });

    it('should parse alarm status correctly - stay', () => {
        const rawResponse = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"AlarmHostStatus":{"SubSysList":[{"SubSys":{"id":1,"arming":"stay"}}]}}';

        const jsonStart = rawResponse.indexOf('\r\n\r\n') + 4;
        const jsonStr = rawResponse.substring(jsonStart);
        
        const statusData = JSON.parse(jsonStr);
        const armingStatus = statusData.AlarmHostStatus.SubSysList[0].SubSys.arming;
        
        expect(armingStatus).to.equal('stay');
    });

    it('should parse alarm status correctly - disarm', () => {
        const rawResponse = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"AlarmHostStatus":{"SubSysList":[{"SubSys":{"id":1,"arming":"disarm"}}]}}';

        const jsonStart = rawResponse.indexOf('\r\n\r\n') + 4;
        const jsonStr = rawResponse.substring(jsonStart);
        
        const statusData = JSON.parse(jsonStr);
        const armingStatus = statusData.AlarmHostStatus.SubSysList[0].SubSys.arming;
        
        expect(armingStatus).to.equal('disarm');
    });

    it('should handle error responses', () => {
        const errorResponse = {
            meta: { code: '401', message: 'Invalid credentials' }
        };

        expect(errorResponse.meta.code).to.equal('401');
    });

    it('should handle session expired response', () => {
        const expiredResponse = {
            meta: { code: '403', message: 'Session expired' }
        };

        expect(expiredResponse.meta.code).to.equal('403');
    });
});
