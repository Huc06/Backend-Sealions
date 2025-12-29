import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { SharingService } from '../sharing/sharing.service';
import { Permission } from '../sharing/dto/share-page.dto';
import { WalrusStorageService } from '../walrus/walrus-storage.service';
import { SealEncryptionService } from '../seal/seal-encryption.service';
import { WalrusPricingService } from '../walrus/walrus-pricing.service';
import { ConvertPageModeDto } from './dto/convert-page-mode.dto';
import { PageMode } from './dto/create-page.dto';

@Injectable()
export class PagesService {
  constructor(
    private prisma: PrismaService,
    private sharingService: SharingService,
    private walrusStorage: WalrusStorageService,
    private sealEncryption: SealEncryptionService,
    private walrusPricing: WalrusPricingService,
  ) {}

  async create(userId: string, createPageDto: CreatePageDto) {
    const mode = createPageDto.mode || PageMode.TRADITIONAL;

    const page = await this.prisma.page.create({
      data: {
        title: createPageDto.title || 'Untitled',
        userId,
        mode: mode as any, // Type assertion for demo - database has this field
      },
      include: {
        blocks: {
          where: { isDeleted: false },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return page;
  }

  async findAll(
    userId: string,
    options?: {
      search?: string;
      tagIds?: string[];
      sortBy?: 'updatedAt' | 'createdAt' | 'title';
      sortOrder?: 'asc' | 'desc';
      includeShared?: boolean; // Include pages shared with user
    },
  ) {
    // Get pages owned by user
    const where: any = {
      userId,
      isDeleted: false, // Exclude deleted pages by default
    };

    // Search by title
    if (options?.search) {
      where.title = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    // Filter by tags
    if (options?.tagIds && options.tagIds.length > 0) {
      where.pageTags = {
        some: {
          tagId: {
            in: options.tagIds,
          },
        },
      };
    }

    // Sort options
    const sortBy = options?.sortBy || 'updatedAt';
    const sortOrder = options?.sortOrder || 'desc';

    const pages = await this.prisma.page.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        blocks: {
          where: { isDeleted: false },
          orderBy: {
            position: 'asc',
          },
        },
        pageTags: {
          include: {
            tag: true,
          },
        },
        shares: options?.includeShared
          ? {
              where: { sharedWith: userId },
            }
          : false,
      },
    });

    // If includeShared is true, also get pages shared with user
    if (options?.includeShared) {
      const sharedPages = await this.prisma.pageShare.findMany({
        where: {
          sharedWith: userId,
          page: {
            isDeleted: false,
          },
        },
        include: {
          page: {
            include: {
              blocks: {
                where: { isDeleted: false },
                orderBy: {
                  position: 'asc',
                },
              },
              pageTags: {
                include: {
                  tag: true,
                },
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // Merge shared pages with owned pages
      const sharedPagesData = sharedPages.map((share) => ({
        ...share.page,
        sharedPermission: share.permission,
        sharedAt: share.createdAt,
      }));

      return [...pages, ...sharedPagesData].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }

    return pages;
  }

  async findOne(id: string, userId: string, includeDeleted: boolean = false) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          where: includeDeleted ? undefined : { isDeleted: false },
          orderBy: {
            position: 'asc',
          },
        },
        pageTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Check if user is owner or has access via sharing
    const hasAccess = await this.sharingService.checkPermission(
      id,
      userId,
      Permission.VIEW,
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    return page;
  }

  async update(id: string, userId: string, updatePageDto: UpdatePageDto) {
    // Check if page exists and user has EDIT permission
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const hasEditPermission = await this.sharingService.checkPermission(
      id,
      userId,
      Permission.EDIT,
    );

    if (!hasEditPermission) {
      throw new ForbiddenException('You do not have permission to edit this page');
    }

    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: updatePageDto,
      include: {
        blocks: {
          where: { isDeleted: false },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return updatedPage;
  }

  async remove(id: string, userId: string) {
    // Check if page exists and belongs to user
    const page = await this.findOne(id, userId, true);

    // Soft delete: mark as deleted
    await this.prisma.page.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Also soft delete all blocks in this page
    await this.prisma.block.updateMany({
      where: { pageId: id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Page moved to trash successfully' };
  }

  /**
   * Get all deleted pages (trash)
   */
  async getTrash(userId: string) {
    return this.prisma.page.findMany({
      where: {
        userId,
        isDeleted: true,
      },
      orderBy: {
        deletedAt: 'desc',
      },
      include: {
        blocks: {
          where: { isDeleted: true },
          orderBy: {
            position: 'asc',
          },
        },
        pageTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Restore a deleted page
   */
  async restore(id: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!page.isDeleted) {
      throw new BadRequestException('Page is not deleted');
    }

    // Restore page
    await this.prisma.page.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    // Restore all blocks in this page
    await this.prisma.block.updateMany({
      where: { pageId: id, isDeleted: true },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return { message: 'Page restored successfully' };
  }

  /**
   * Permanently delete a page
   */
  async permanentDelete(id: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!page.isDeleted) {
      throw new BadRequestException('Page must be in trash before permanent deletion');
    }

    // Hard delete (cascade will delete blocks and pageTags)
    await this.prisma.page.delete({
      where: { id },
    });

    return { message: 'Page permanently deleted' };
  }

  /**
   * Convert page mode between TRADITIONAL and SECURE
   */
  async convertMode(
    id: string,
    userId: string,
    convertDto: ConvertPageModeDto,
  ) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          where: { isDeleted: false },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // If converting to same mode, return
    if ((page as any).mode === convertDto.mode) {
      throw new BadRequestException(`Page is already in ${convertDto.mode} mode`);
    }

    if (convertDto.mode === PageMode.SECURE) {
      // Convert TRADITIONAL → SECURE
      if (!convertDto.epochs || convertDto.epochs < 1) {
        throw new BadRequestException('Epochs must be provided and >= 1 when converting to SECURE mode');
      }

      // Serialize page content (blocks)
      const pageContent = JSON.stringify({
        blocks: page.blocks,
        title: page.title,
      });

      // Encrypt with Seal
      const encrypted = await this.sealEncryption.encrypt(
        Buffer.from(pageContent, 'utf-8'),
        userId,
      );

      // Upload to Walrus
      const uploadResult = await this.walrusStorage.upload(
        encrypted.encrypted,
        convertDto.epochs,
        true, // Use Quilt for cheaper storage
      );

      // Calculate storage cost
      const pricing = this.walrusPricing.calculatePricing(
        uploadResult.size,
        convertDto.epochs,
      );

      // Update page to SECURE mode
      const updatedPage = await this.prisma.page.update({
        where: { id },
        data: {
          mode: PageMode.SECURE as any,
          storageLocation: uploadResult.cid as any,
          policyId: encrypted.policyId as any,
          expiryDate: uploadResult.expiryDate as any,
          storageCost: pricing.priceQuilt.toString() as any,
          epochs: convertDto.epochs as any,
        },
        include: {
          blocks: {
            where: { isDeleted: false },
            orderBy: { position: 'asc' },
          },
        },
      });

      return {
        ...updatedPage,
        message: 'Page converted to SECURE mode successfully',
        storageInfo: {
          cid: uploadResult.cid,
          cost: pricing.priceQuilt,
          estimatedUSD: pricing.estimatedUSD,
          durationYears: pricing.durationYears,
        },
      };
    } else {
      // Convert SECURE → TRADITIONAL
      if (!(page as any).storageLocation) {
        throw new BadRequestException('Page is not in SECURE mode');
      }

      // Retrieve from Walrus
      const encryptedData = await this.walrusStorage.retrieve((page as any).storageLocation);

      // Decrypt with Seal
      const decrypted = await this.sealEncryption.decrypt(
        encryptedData,
        (page as any).policyId!,
        userId,
      );

      // Parse decrypted content
      const pageContent = JSON.parse(decrypted.toString('utf-8'));

      // Update page to TRADITIONAL mode
      const updatedPage = await this.prisma.page.update({
        where: { id },
        data: {
          mode: PageMode.TRADITIONAL as any,
          storageLocation: null as any,
          policyId: null as any,
          expiryDate: null as any,
          storageCost: null as any,
          epochs: null as any,
        },
        include: {
          blocks: {
            where: { isDeleted: false },
            orderBy: { position: 'asc' },
          },
        },
      });

      return {
        ...updatedPage,
        message: 'Page converted to TRADITIONAL mode successfully',
      };
    }
  }

  /**
   * Get storage information for a secure page
   */
  async getStorageInfo(id: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if ((page as any).mode !== PageMode.SECURE) {
      throw new BadRequestException('Page is not in SECURE mode');
    }

    if (!(page as any).storageLocation || !(page as any).epochs) {
      throw new BadRequestException('Storage information not available');
    }

    const now = new Date();
    const expiryDate = (page as any).expiryDate || new Date();
    const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      cid: (page as any).storageLocation,
      policyId: (page as any).policyId,
      expiryDate: (page as any).expiryDate,
      daysRemaining,
      epochs: (page as any).epochs,
      storageCost: (page as any).storageCost,
      isExpiringSoon: daysRemaining < 30,
    };
  }
}

