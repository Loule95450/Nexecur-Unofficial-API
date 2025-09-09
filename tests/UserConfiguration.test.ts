import { expect } from 'chai';
import { describe, it } from 'mocha';
import { UserConfiguration } from '../src/models/UserConfiguration';

describe('UserConfiguration', () => {
    describe('constructor', () => {
        it('should create instance with default values', () => {
            const config = new UserConfiguration();
            
            expect(config.token).to.equal('');
            expect(config.idSite).to.equal('');
            expect(config.password).to.equal('');
            expect(config.idDevice).to.equal('');
            expect(config.pin).to.equal('');
            expect(config.deviceName).to.equal('');
        });

        it('should create instance with provided values', () => {
            const config = new UserConfiguration({
                token: 'test-token',
                idSite: 'site-123',
                password: 'password',
                idDevice: 'device-456',
                pin: 'pin',
                deviceName: 'My Device'
            });
            
            expect(config.token).to.equal('test-token');
            expect(config.idSite).to.equal('site-123');
            expect(config.password).to.equal('password');
            expect(config.idDevice).to.equal('device-456');
            expect(config.pin).to.equal('pin');
            expect(config.deviceName).to.equal('My Device');
        });
    });

    describe('isValid', () => {
        it('should return true when idSite and password are provided', () => {
            const config = new UserConfiguration({
                idSite: 'site-123',
                password: 'password'
            });
            
            expect(config.isValid()).to.be.true;
        });

        it('should return false when idSite is missing', () => {
            const config = new UserConfiguration({
                password: 'password'
            });
            
            expect(config.isValid()).to.be.false;
        });

        it('should return false when password is missing', () => {
            const config = new UserConfiguration({
                idSite: 'site-123'
            });
            
            expect(config.isValid()).to.be.false;
        });
    });

    describe('isDeviceRegistered', () => {
        it('should return true when token and idDevice are provided', () => {
            const config = new UserConfiguration({
                token: 'test-token',
                idDevice: 'device-123'
            });
            
            expect(config.isDeviceRegistered()).to.be.true;
        });

        it('should return false when token is missing', () => {
            const config = new UserConfiguration({
                idDevice: 'device-123'
            });
            
            expect(config.isDeviceRegistered()).to.be.false;
        });

        it('should return false when idDevice is missing', () => {
            const config = new UserConfiguration({
                token: 'test-token'
            });
            
            expect(config.isDeviceRegistered()).to.be.false;
        });
    });

    describe('clone', () => {
        it('should create an exact copy', () => {
            const original = new UserConfiguration({
                token: 'test-token',
                idSite: 'site-123',
                password: 'password',
                idDevice: 'device-456',
                pin: 'pin',
                deviceName: 'My Device'
            });
            
            const clone = original.clone();
            
            expect(clone).to.not.equal(original); // Different instances
            expect(clone.token).to.equal(original.token);
            expect(clone.idSite).to.equal(original.idSite);
            expect(clone.password).to.equal(original.password);
            expect(clone.idDevice).to.equal(original.idDevice);
            expect(clone.pin).to.equal(original.pin);
            expect(clone.deviceName).to.equal(original.deviceName);
        });
    });

    describe('fromJSON', () => {
        it('should create instance from JSON with snake_case properties', () => {
            const jsonData = {
                token: 'test-token',
                id_site: 'site-123',
                password: 'password',
                id_device: 'device-456',
                pin: 'pin',
                deviceName: 'My Device'
            };
            
            const config = UserConfiguration.fromJSON(jsonData);
            
            expect(config.token).to.equal('test-token');
            expect(config.idSite).to.equal('site-123');
            expect(config.password).to.equal('password');
            expect(config.idDevice).to.equal('device-456');
            expect(config.pin).to.equal('pin');
            expect(config.deviceName).to.equal('My Device');
        });

        it('should create instance from JSON with camelCase properties', () => {
            const jsonData = {
                token: 'test-token',
                idSite: 'site-123',
                password: 'password',
                idDevice: 'device-456',
                pin: 'pin',
                deviceName: 'My Device'
            };
            
            const config = UserConfiguration.fromJSON(jsonData);
            
            expect(config.token).to.equal('test-token');
            expect(config.idSite).to.equal('site-123');
            expect(config.password).to.equal('password');
            expect(config.idDevice).to.equal('device-456');
            expect(config.pin).to.equal('pin');
            expect(config.deviceName).to.equal('My Device');
        });

        it('should handle missing properties gracefully', () => {
            const jsonData = {
                token: 'test-token'
            };
            
            const config = UserConfiguration.fromJSON(jsonData);
            
            expect(config.token).to.equal('test-token');
            expect(config.idSite).to.equal('');
            expect(config.password).to.equal('');
            expect(config.idDevice).to.equal('');
            expect(config.pin).to.equal('');
            expect(config.deviceName).to.equal('');
        });
    });

    describe('toJSON', () => {
        it('should return plain object representation', () => {
            const config = new UserConfiguration({
                token: 'test-token',
                idSite: 'site-123',
                password: 'password',
                idDevice: 'device-456',
                pin: 'pin',
                deviceName: 'My Device'
            });
            
            const json = config.toJSON();
            
            expect(json).to.deep.equal({
                token: 'test-token',
                idSite: 'site-123',
                password: 'password',
                idDevice: 'device-456',
                pin: 'pin',
                deviceName: 'My Device'
            });
        });
    });
});