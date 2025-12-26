import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPageDto: CreatePageDto) {
    const page = await this.prisma.page.create({
      data: {
        title: createPageDto.title || 'Untitled',
        userId,
      },
      include: {
        blocks: {
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
    },
  ) {
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

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return page;
  }

  async update(id: string, userId: string, updatePageDto: UpdatePageDto) {
    // Check if page exists and belongs to user
    await this.findOne(id, userId);

    const page = await this.prisma.page.update({
      where: { id },
      data: updatePageDto,
      include: {
        blocks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return page;
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
}

