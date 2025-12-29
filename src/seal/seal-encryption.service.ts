import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Mock Seal Encryption Service for Demo
 * Simulates Seal threshold encryption without requiring real SDK
 * Uses AES-256-GCM for demo purposes (in production, use Seal SDK)
 */
@Injectable()
export class SealEncryptionService {
  private readonly logger = new Logger(SealEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits

  constructor(private configService: ConfigService) {}

  /**
   * Encrypt data with Seal (mock)
   * Returns encrypted data and policy ID
   */
  async encrypt(
    data: string | Buffer,
    userId: string,
    accessPolicy?: {
      type?: 'user-only' | 'time-locked' | 'token-gated';
      expiryDate?: Date;
    },
  ): Promise<{
    encrypted: Buffer;
    policyId: string;
    iv: Buffer;
    tag: Buffer;
  }> {
    const plaintext = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;

    // Generate encryption key (in production, Seal handles this)
    const key = crypto.randomBytes(this.keyLength);
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Generate mock policy ID
    const policyId = `policy_${crypto.randomBytes(16).toString('hex')}`;

    // Store key with policy ID (in production, Seal manages this onchain)
    // For demo, we'll store in memory (in production, this is handled by Seal SDK)
    this.logger.log(`Mock encrypt: policyId=${policyId}, size=${plaintext.length} bytes`);

    // Combine key + encrypted data for demo (in production, Seal handles key management)
    const combined = Buffer.concat([
      key, // Store key with encrypted data for demo (NOT secure, just for demo!)
      iv,
      tag,
      encrypted,
    ]);

    return {
      encrypted: combined,
      policyId,
      iv,
      tag,
    };
  }

  /**
   * Decrypt data with Seal (mock)
   */
  async decrypt(
    encryptedData: Buffer,
    policyId: string,
    userId: string,
  ): Promise<Buffer> {
    // Extract components (for demo, key is stored with data)
    const key = encryptedData.subarray(0, this.keyLength);
    const iv = encryptedData.subarray(this.keyLength, this.keyLength + 16);
    const tag = encryptedData.subarray(this.keyLength + 16, this.keyLength + 32);
    const encrypted = encryptedData.subarray(this.keyLength + 32);

    // Check access permission (mock - in production, Seal checks onchain)
    // For demo, we'll just log it
    this.logger.log(`Mock decrypt: policyId=${policyId}, userId=${userId}`);

    // Decrypt
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    this.logger.log(`Mock decrypt: success, size=${decrypted.length} bytes`);
    return decrypted;
  }

  /**
   * Check if user has access to decrypt (mock)
   */
  async checkAccess(policyId: string, userId: string): Promise<boolean> {
    // Mock: always return true for demo
    // In production, Seal checks onchain access policies
    this.logger.log(`Mock checkAccess: policyId=${policyId}, userId=${userId}`);
    return true;
  }

  /**
   * Create access policy (mock)
   */
  async createPolicy(
    userId: string,
    options?: {
      type?: 'user-only' | 'time-locked' | 'token-gated';
      expiryDate?: Date;
      allowedUsers?: string[];
    },
  ): Promise<string> {
    const policyId = `policy_${crypto.randomBytes(16).toString('hex')}`;
    this.logger.log(`Mock createPolicy: policyId=${policyId}, userId=${userId}`);
    return policyId;
  }
}

