import { expect } from 'chai';
import { describe, it } from 'mocha';
import { EncryptionKeys } from '../src/helpers/EncryptionKeys';

describe('EncryptionKeys', () => {
    const testPassword = 'testPassword123';
    const testSalt = 'dGVzdFNhbHQ='; // base64 encoded "testSalt"

    describe('constructor', () => {
        it('should create instance with provided password and salt', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            
            expect(keys.password).to.equal(testPassword);
            expect(keys.salt).to.equal(testSalt);
        });
    });

    describe('generateKeys', () => {
        it('should generate password hash and pin hash', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            
            expect(keys.areKeysGenerated()).to.be.false;
            
            keys.generateKeys();
            
            expect(keys.areKeysGenerated()).to.be.true;
            expect(keys.passwordHash).to.be.a('string');
            expect(keys.pinHash).to.be.a('string');
            expect(keys.passwordHash.length).to.be.greaterThan(0);
            expect(keys.pinHash.length).to.be.greaterThan(0);
        });

        it('should generate consistent hashes for same input', () => {
            const keys1 = new EncryptionKeys(testPassword, testSalt);
            const keys2 = new EncryptionKeys(testPassword, testSalt);
            
            keys1.generateKeys();
            keys2.generateKeys();
            
            expect(keys1.passwordHash).to.equal(keys2.passwordHash);
            expect(keys1.pinHash).to.equal(keys2.pinHash);
        });

        it('should generate different hashes for different passwords', () => {
            const keys1 = new EncryptionKeys('password1', testSalt);
            const keys2 = new EncryptionKeys('password2', testSalt);
            
            keys1.generateKeys();
            keys2.generateKeys();
            
            expect(keys1.passwordHash).to.not.equal(keys2.passwordHash);
            expect(keys1.pinHash).to.not.equal(keys2.pinHash);
        });

        it('should generate different hashes for different salts', () => {
            const keys1 = new EncryptionKeys(testPassword, 'c2FsdDE=');
            const keys2 = new EncryptionKeys(testPassword, 'c2FsdDI=');
            
            keys1.generateKeys();
            keys2.generateKeys();
            
            expect(keys1.passwordHash).to.not.equal(keys2.passwordHash);
            expect(keys1.pinHash).to.not.equal(keys2.pinHash);
        });

        it('should handle invalid base64 salt', async () => {
            const keys = new EncryptionKeys(testPassword, 'invalid-base64!');
            
            // The method might not throw immediately, but should still generate keys
            // (Node.js Buffer.from() is quite permissive with invalid base64)
            expect(() => keys.generateKeys()).to.not.throw();
            expect(keys.areKeysGenerated()).to.be.true;
        });
    });

    describe('hash methods', () => {
        it('should create SHA-1 hash', () => {
            const testData = Buffer.from('test data', 'utf8');
            const hash = EncryptionKeys.createSha1Hash(testData);
            
            expect(hash).to.be.a('string');
            expect(hash.length).to.be.greaterThan(0);
            // SHA-1 base64 encoded should be consistent
            expect(hash).to.equal(EncryptionKeys.createSha1Hash(testData));
        });

        it('should create SHA-256 hash', () => {
            const testData = Buffer.from('test data', 'utf8');
            const hash = EncryptionKeys.createSha256Hash(testData);
            
            expect(hash).to.be.a('string');
            expect(hash.length).to.be.greaterThan(0);
            // SHA-256 base64 encoded should be consistent
            expect(hash).to.equal(EncryptionKeys.createSha256Hash(testData));
        });

        it('should create different hashes for different algorithms', () => {
            const testData = Buffer.from('test data', 'utf8');
            const sha1Hash = EncryptionKeys.createSha1Hash(testData);
            const sha256Hash = EncryptionKeys.createSha256Hash(testData);
            
            expect(sha1Hash).to.not.equal(sha256Hash);
        });
    });

    describe('property access', () => {
        it('should throw error when accessing hashes before generation', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            
            expect(() => keys.passwordHash).to.throw('Password hash not generated');
            expect(() => keys.pinHash).to.throw('PIN hash not generated');
        });

        it('should return hashes after generation', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            keys.generateKeys();
            
            expect(() => keys.passwordHash).to.not.throw();
            expect(() => keys.pinHash).to.not.throw();
            expect(keys.passwordHash).to.be.a('string');
            expect(keys.pinHash).to.be.a('string');
        });
    });

    describe('areKeysGenerated', () => {
        it('should return false before key generation', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            
            expect(keys.areKeysGenerated()).to.be.false;
        });

        it('should return true after key generation', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            keys.generateKeys();
            
            expect(keys.areKeysGenerated()).to.be.true;
        });
    });

    describe('clearKeys', () => {
        it('should clear generated keys', () => {
            const keys = new EncryptionKeys(testPassword, testSalt);
            keys.generateKeys();
            
            expect(keys.areKeysGenerated()).to.be.true;
            
            keys.clearKeys();
            
            expect(keys.areKeysGenerated()).to.be.false;
            expect(() => keys.passwordHash).to.throw();
            expect(() => keys.pinHash).to.throw();
        });
    });

    describe('edge cases', () => {
        it('should handle empty password', () => {
            const keys = new EncryptionKeys('', testSalt);
            
            expect(() => keys.generateKeys()).to.not.throw();
            expect(keys.areKeysGenerated()).to.be.true;
        });

        it('should handle unicode characters in password', () => {
            const unicodePassword = '测试密码🔒';
            const keys = new EncryptionKeys(unicodePassword, testSalt);
            
            expect(() => keys.generateKeys()).to.not.throw();
            expect(keys.areKeysGenerated()).to.be.true;
        });
    });
});