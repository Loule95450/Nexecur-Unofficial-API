/**
 * Unit tests for NexecurAlarmClient
 * Tests the unified client supporting both Videofied and Hikvision versions
 * Uses Mocha + Chai (project test framework)
 */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { NexecurAlarmClient, AlarmVersion } from '../src/NexecurAlarm';

describe('NexecurAlarmClient', () => {
    describe('constructor - Videofied', () => {
        it('should create Videofied client with idSite and password', () => {
            const client = new NexecurAlarmClient({
                version: AlarmVersion.VIDEOFIED,
                idSite: '12345',
                password: 'mypin'
            });

            expect(client).to.be.instanceOf(NexecurAlarmClient);
            expect(client.getAlarmVersion()).to.equal(AlarmVersion.VIDEOFIED);
        });

        it('should create Videofied client with custom device name', () => {
            const client = new NexecurAlarmClient({
                version: AlarmVersion.VIDEOFIED,
                idSite: '12345',
                password: 'mypin',
                deviceName: 'My Custom Device'
            });

            expect(client).to.be.instanceOf(NexecurAlarmClient);
        });

        it('should throw error for Videofied without idSite', () => {
            expect(() => {
                new NexecurAlarmClient({
                    version: AlarmVersion.VIDEOFIED,
                    password: 'mypin'
                });
            }).to.throw('idSite and password are required for Videofied version');
        });

        it('should throw error for Videofied without password', () => {
            expect(() => {
                new NexecurAlarmClient({
                    version: AlarmVersion.VIDEOFIED,
                    idSite: '12345'
                });
            }).to.throw('idSite and password are required for Videofied version');
        });
    });

    describe('constructor - Hikvision', () => {
        it('should create Hikvision client with phone and password', () => {
            const client = new NexecurAlarmClient({
                version: AlarmVersion.HIKVISION,
                phone: '0612345678',
                password: 'cloudpassword',
                countryCode: '33',
                ssid: 'MyWiFi'
            });

            expect(client).to.be.instanceOf(NexecurAlarmClient);
            expect(client.getAlarmVersion()).to.equal(AlarmVersion.HIKVISION);
        });

        it('should create Hikvision client with email', () => {
            const client = new NexecurAlarmClient({
                version: AlarmVersion.HIKVISION,
                email: 'test@example.com',
                password: 'cloudpassword',
                countryCode: '33',
                ssid: 'MyWiFi'
            });

            expect(client).to.be.instanceOf(NexecurAlarmClient);
        });

        it('should use default countryCode (33)', () => {
            const client = new NexecurAlarmClient({
                version: AlarmVersion.HIKVISION,
                phone: '0612345678',
                password: 'cloudpassword',
                ssid: 'MyWiFi'
            });

            expect(client).to.be.instanceOf(NexecurAlarmClient);
        });

        it('should throw error for Hikvision without phone or email', () => {
            expect(() => {
                new NexecurAlarmClient({
                    version: AlarmVersion.HIKVISION,
                    password: 'cloudpassword'
                });
            }).to.throw('password and (phone or email) are required for Hikvision version');
        });

        it('should throw error for Hikvision without password', () => {
            expect(() => {
                new NexecurAlarmClient({
                    version: AlarmVersion.HIKVISION,
                    phone: '0612345678'
                });
            }).to.throw('password and (phone or email) are required for Hikvision version');
        });
    });
});

describe('AlarmVersion enum', () => {
    it('should have correct value for VIDEOFIED', () => {
        expect(AlarmVersion.VIDEOFIED).to.equal('videofied');
    });

    it('should have correct value for HIKVISION', () => {
        expect(AlarmVersion.HIKVISION).to.equal('hikvision');
    });
});

describe('Alarm version detection', () => {
    it('should correctly identify Videofied version', () => {
        const client = new NexecurAlarmClient({
            version: AlarmVersion.VIDEOFIED,
            idSite: '12345',
            password: 'mypin'
        });

        expect(client.getAlarmVersion()).to.equal(AlarmVersion.VIDEOFIED);
    });

    it('should correctly identify Hikvision version', () => {
        const client = new NexecurAlarmClient({
            version: AlarmVersion.HIKVISION,
            phone: '0612345678',
            password: 'cloudpassword',
            countryCode: '33',
            ssid: 'MyWiFi'
        });

        expect(client.getAlarmVersion()).to.equal(AlarmVersion.HIKVISION);
    });
});

describe('Configuration validation', () => {
    it('should accept full Hikvision configuration', () => {
        const config = {
            version: AlarmVersion.HIKVISION,
            phone: '0612345678',
            email: undefined,
            password: 'test123',
            countryCode: '33',
            ssid: 'MyNetwork',
            deviceName: 'My Device'
        };

        const client = new NexecurAlarmClient(config);
        expect(client).to.be.instanceOf(NexecurAlarmClient);
    });

    it('should accept full Videofied configuration', () => {
        const config = {
            version: AlarmVersion.VIDEOFIED,
            idSite: 'ABC123',
            password: 'pin123',
            deviceName: 'Home Assistant'
        };

        const client = new NexecurAlarmClient(config);
        expect(client).to.be.instanceOf(NexecurAlarmClient);
    });
});
