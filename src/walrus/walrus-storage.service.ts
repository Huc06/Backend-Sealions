import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Mock Walrus Storage Service for Demo
 * Simulates Walrus storage operations without requiring real SDK
 */
@Injectable()
export class WalrusStorageService {
  private readonly logger = new Logger(WalrusStorageService.name);
  private readonly storage = new Map<string, Buffer>(); // In-memory storage for demo

  constructor(private configService: ConfigService) {}

  /**
   * Upload encrypted data to Walrus (mock)
   * Returns CID (Content Identifier) and expiry date
   */
  async upload(
    encryptedData: Buffer | string,
    epochs: number = 52, // Default: 2 years
    useQuilt: boolean = true,
  ): Promise<{
    cid: string;
    expiryDate: Date;
    size: number;
  }> {
    const data = typeof encryptedData === 'string' ? Buffer.from(encryptedData) : encryptedData;
    const size = data.length;

    // Generate mock CID (Content Identifier)
    const cid = `bafybei${Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64url').substring(0, 44)}`;

    // Calculate expiry date (1 epoch = 14 days)
    const epochDays = 14;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + epochs * epochDays);

    // Store in memory (for demo)
    this.storage.set(cid, data);

    this.logger.log(`Mock upload: CID=${cid}, size=${size} bytes, epochs=${epochs}`);

    return {
      cid,
      expiryDate,
      size,
    };
  }

  /**
   * Retrieve encrypted data from Walrus (mock)
   */
  async retrieve(cid: string): Promise<Buffer> {
    const data = this.storage.get(cid);
    if (!data) {
      throw new Error(`Data not found for CID: ${cid}`);
    }
    this.logger.log(`Mock retrieve: CID=${cid}, size=${data.length} bytes`);
    return data;
  }

  /**
   * Delete data from Walrus (mock)
   */
  async delete(cid: string): Promise<void> {
    this.storage.delete(cid);
    this.logger.log(`Mock delete: CID=${cid}`);
  }

  /**
   * Renew storage (extend expiry date)
   */
  async renew(cid: string, additionalEpochs: number): Promise<Date> {
    const data = this.storage.get(cid);
    if (!data) {
      throw new Error(`Data not found for CID: ${cid}`);
    }

    const epochDays = 14;
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + additionalEpochs * epochDays);

    this.logger.log(`Mock renew: CID=${cid}, additional epochs=${additionalEpochs}`);
    return newExpiryDate;
  }
}

