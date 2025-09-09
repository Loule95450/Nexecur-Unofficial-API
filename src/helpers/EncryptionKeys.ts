import * as crypto from 'crypto';

/**
 * Handles encryption key generation for Nexecur authentication
 */
export class EncryptionKeys {
    private readonly originalPassword: string;
    private readonly saltValue: string;
    private passwordHashValue: string = '';
    private pinHashValue: string = '';

    /**
     * Creates a new EncryptionKeys instance
     * @param password - Original password to hash
     * @param salt - Base64 encoded salt value
     */
    constructor(password: string, salt: string) {
        this.originalPassword = password;
        this.saltValue = salt;
    }

    /**
     * Generates the password hash and PIN hash using the Nexecur algorithm
     * This method implements the specific hashing algorithm required by Nexecur
     */
    public generateKeys(): void {
        try {
            // Convert password to UTF-16LE buffer
            const passwordBuffer = Buffer.from(this.originalPassword, 'utf16le');
            
            // Decode base64 salt
            const saltBuffer = Buffer.from(this.saltValue, 'base64');
            
            // Create combined buffer with salt + password
            const combinedBuffer = Buffer.alloc(saltBuffer.length + passwordBuffer.length);
            
            // Copy salt first, then password
            saltBuffer.copy(combinedBuffer, 0);
            passwordBuffer.copy(combinedBuffer, saltBuffer.length);
            
            // Generate hashes
            this.pinHashValue = EncryptionKeys.createSha1Hash(combinedBuffer);
            this.passwordHashValue = EncryptionKeys.createSha256Hash(combinedBuffer);
            
        } catch (error) {
            throw new Error(`Failed to generate encryption keys: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Creates SHA-1 hash of the provided data
     * @param data - Data to hash
     * @returns Base64 encoded SHA-1 hash
     */
    public static createSha1Hash(data: Buffer): string {
        return crypto.createHash('sha1').update(data).digest('base64');
    }

    /**
     * Creates SHA-256 hash of the provided data
     * @param data - Data to hash
     * @returns Base64 encoded SHA-256 hash
     */
    public static createSha256Hash(data: Buffer): string {
        return crypto.createHash('sha256').update(data).digest('base64');
    }

    /**
     * Gets the original password
     * @returns Original password
     */
    public get password(): string {
        return this.originalPassword;
    }

    /**
     * Gets the salt value
     * @returns Salt value
     */
    public get salt(): string {
        return this.saltValue;
    }

    /**
     * Gets the generated password hash
     * @returns Password hash (SHA-256)
     * @throws Error if keys haven't been generated yet
     */
    public get passwordHash(): string {
        if (!this.passwordHashValue) {
            throw new Error('Password hash not generated. Call generateKeys() first.');
        }
        return this.passwordHashValue;
    }

    /**
     * Gets the generated PIN hash
     * @returns PIN hash (SHA-1)
     * @throws Error if keys haven't been generated yet
     */
    public get pinHash(): string {
        if (!this.pinHashValue) {
            throw new Error('PIN hash not generated. Call generateKeys() first.');
        }
        return this.pinHashValue;
    }

    /**
     * Checks if the keys have been generated
     * @returns True if keys are generated
     */
    public areKeysGenerated(): boolean {
        return !!(this.passwordHashValue && this.pinHashValue);
    }

    /**
     * Clears the generated hash values for security
     */
    public clearKeys(): void {
        this.passwordHashValue = '';
        this.pinHashValue = '';
    }
}