import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { StorageService, UploadResult } from './storage.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { multerConfig } from './multer.config';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (images, videos, PDFs, documents)',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name for organization',
          example: 'pages',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    schema: {
      example: {
        public_id: 'notely/pages/abc123',
        secure_url: 'https://res.cloudinary.com/cloud/image/upload/v123/notely/pages/abc123.jpg',
        url: 'http://res.cloudinary.com/cloud/image/upload/v123/notely/pages/abc123.jpg',
        width: 1920,
        height: 1080,
        format: 'jpg',
        bytes: 245678,
        resource_type: 'image',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Request() request: any,
  ): Promise<UploadResult> {
    const folder = request.body?.folder || 'general';
    return this.storageService.uploadFile(file, folder);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple files to upload',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name for organization',
          example: 'pages',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Files uploaded successfully',
    schema: {
      example: [
        {
          public_id: 'notely/pages/abc123',
          secure_url: 'https://res.cloudinary.com/cloud/image/upload/v123/notely/pages/abc123.jpg',
          url: 'http://res.cloudinary.com/cloud/image/upload/v123/notely/pages/abc123.jpg',
          format: 'jpg',
          bytes: 245678,
          resource_type: 'image',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadFiles(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() request: any,
  ): Promise<UploadResult[]> {
    const folder = request.body?.folder || 'general';
    return this.storageService.uploadFiles(files, folder);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete a file from Cloudinary' })
  @ApiParam({
    name: 'publicId',
    description: 'Cloudinary public_id of the file',
    example: 'notely/pages/abc123',
  })
  @ApiCreatedResponse({
    description: 'File deleted successfully',
    schema: {
      example: {
        message: 'File deleted successfully',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteFile(@Param('publicId') publicId: string): Promise<{ message: string }> {
    await this.storageService.deleteFile(publicId);
    return { message: 'File deleted successfully' };
  }
}

