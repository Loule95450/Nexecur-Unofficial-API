import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Utils } from '../src/helpers/Utils';

describe('Utils', () => {
    describe('sleep', () => {
        it('should resolve after specified delay', async () => {
            const start = Date.now();
            await Utils.sleep(100);
            const elapsed = Date.now() - start;
            
            // Allow for some variance in timing
            expect(elapsed).to.be.at.least(90);
            expect(elapsed).to.be.at.most(150);
        });

        it('should handle zero delay', async () => {
            const start = Date.now();
            await Utils.sleep(0);
            const elapsed = Date.now() - start;
            
            expect(elapsed).to.be.at.most(10);
        });
    });

    describe('retryWithBackoff', () => {
        it('should succeed on first attempt', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                return 'success';
            };

            const result = await Utils.retryWithBackoff(operation, 3, 10);
            
            expect(result).to.equal('success');
            expect(attempts).to.equal(1);
        });

        it('should retry on failure and eventually succeed', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return 'success';
            };

            const result = await Utils.retryWithBackoff(operation, 3, 10);
            
            expect(result).to.equal('success');
            expect(attempts).to.equal(3);
        });

        it('should throw last error after max retries', async () => {
            let attempts = 0;
            const operation = async () => {
                attempts++;
                throw new Error(`Failure ${attempts}`);
            };

            try {
                await Utils.retryWithBackoff(operation, 2, 10);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.equal('Failure 3');
                expect(attempts).to.equal(3);
            }
        });

        it('should use exponential backoff', async () => {
            let attempts = 0;
            const timestamps: number[] = [];
            
            const operation = async () => {
                timestamps.push(Date.now());
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return 'success';
            };

            await Utils.retryWithBackoff(operation, 3, 100);
            
            expect(timestamps).to.have.length(3);
            // Check that delays are approximately exponential
            const delay1 = timestamps[1] - timestamps[0];
            const delay2 = timestamps[2] - timestamps[1];
            
            expect(delay1).to.be.at.least(90); // ~100ms
            expect(delay2).to.be.at.least(180); // ~200ms
        });
    });

    describe('requireNonNull', () => {
        it('should return value when not null', () => {
            const value = 'test';
            const result = Utils.requireNonNull(value, 'testField');
            
            expect(result).to.equal(value);
        });

        it('should throw error when value is null', () => {
            expect(() => Utils.requireNonNull(null, 'testField'))
                .to.throw('testField cannot be null or undefined');
        });

        it('should throw error when value is undefined', () => {
            expect(() => Utils.requireNonNull(undefined, 'testField'))
                .to.throw('testField cannot be null or undefined');
        });

        it('should handle falsy but valid values', () => {
            expect(Utils.requireNonNull(0, 'number')).to.equal(0);
            expect(Utils.requireNonNull('', 'string')).to.equal('');
            expect(Utils.requireNonNull(false, 'boolean')).to.equal(false);
        });
    });

    describe('safeJsonParse', () => {
        it('should parse valid JSON', () => {
            const jsonString = '{"key": "value", "number": 123}';
            const result = Utils.safeJsonParse(jsonString, {});
            
            expect(result).to.deep.equal({ key: 'value', number: 123 });
        });

        it('should return default value for invalid JSON', () => {
            const invalidJson = '{"key": value}'; // Missing quotes
            const defaultValue = { default: true };
            const result = Utils.safeJsonParse(invalidJson, defaultValue);
            
            expect(result).to.equal(defaultValue);
        });

        it('should handle empty string', () => {
            const defaultValue = { default: true };
            const result = Utils.safeJsonParse('', defaultValue);
            
            expect(result).to.equal(defaultValue);
        });

        it('should handle complex default values', () => {
            const defaultValue = { nested: { array: [1, 2, 3] } };
            const result = Utils.safeJsonParse('invalid', defaultValue);
            
            expect(result).to.equal(defaultValue);
        });
    });

    describe('isEmptyOrWhitespace', () => {
        it('should return true for empty string', () => {
            expect(Utils.isEmptyOrWhitespace('')).to.be.true;
        });

        it('should return true for whitespace only', () => {
            expect(Utils.isEmptyOrWhitespace('   ')).to.be.true;
            expect(Utils.isEmptyOrWhitespace('\t\n\r')).to.be.true;
        });

        it('should return true for null', () => {
            expect(Utils.isEmptyOrWhitespace(null)).to.be.true;
        });

        it('should return true for undefined', () => {
            expect(Utils.isEmptyOrWhitespace(undefined)).to.be.true;
        });

        it('should return false for non-empty strings', () => {
            expect(Utils.isEmptyOrWhitespace('hello')).to.be.false;
            expect(Utils.isEmptyOrWhitespace('  hello  ')).to.be.false;
            expect(Utils.isEmptyOrWhitespace('0')).to.be.false;
        });
    });
});