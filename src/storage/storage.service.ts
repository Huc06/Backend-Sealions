import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
  resource_type: string;
}

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.replace(/^"|"$/g, '');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.replace(/^"|"$/g, '');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.replace(/^"|"$/g, '');

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary Config:', {
        cloudName: cloudName || 'MISSING',
        apiKey: apiKey ? '***' : 'MISSING',
        apiSecret: apiSecret ? '***' : 'MISSING',
      });
      throw new Error(
        'Cloudinary credentials are missing. Please check your .env file:\n' +
        '- CLOUDINARY_CLOUD_NAME\n' +
        '- CLOUDINARY_API_KEY\n' +
        '- CLOUDINARY_API_SECRET',
      );
    }

    console.log('✅ Cloudinary configured with cloud_name:', cloudName);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'notely',
    options?: {
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: any[];
      public_id?: string;
    },
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const uploadOptions: any = {
        folder: `notely/${folder}`,
        resource_type: options?.resource_type || 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      };

      // Add transformations for images
      if (file.mimetype.startsWith('image/') && !options?.transformation) {
        uploadOptions.transformation = [
          {
            quality: 'auto:good',
            fetch_format: 'auto',
          },
        ];
      }

      if (options?.transformation) {
        uploadOptions.transformation = options.transformation;
      }

      if (options?.public_id) {
        uploadOptions.public_id = options.public_id;
      }

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        resource_type: result.resource_type,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'notely',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete file: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    },
  ): string {
    const transformations: any = {};

    if (options?.width) transformations.width = options.width;
    if (options?.height) transformations.height = options.height;
    if (options?.quality) transformations.quality = options.quality;
    if (options?.format) transformations.format = options.format;

    return cloudinary.url(publicId, {
      secure: true,
      transformation: [transformations],
    });
  }
}

