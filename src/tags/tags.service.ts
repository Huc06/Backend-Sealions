import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new tag
   */
  async create(userId: string, name: string) {
    // Check if tag already exists for this user
    const existingTag = await this.prisma.tag.findUnique({
      where: {
        name_userId: {
          name: name.toLowerCase().trim(),
          userId,
        },
      },
    });

    if (existingTag) {
      throw new ConflictException(`Tag "${name}" already exists`);
    }

    return this.prisma.tag.create({
      data: {
        name: name.toLowerCase().trim(),
        userId,
      },
    });
  }

  /**
   * Get all tags for a user
   */
  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { pageTags: true },
        },
      },
    });
  }

  /**
   * Get a single tag by ID
   */
  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pageTags: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return tag;
  }

  /**
   * Delete a tag
   */
  async remove(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Delete tag (cascade will remove PageTag relations)
    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: 'Tag deleted successfully' };
  }

  /**
   * Add tag to page
   */
  async addTagToPage(pageId: string, tagId: string, userId: string) {
    // Verify page belongs to user
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify tag belongs to user
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Check if tag already added to page
    const existingPageTag = await this.prisma.pageTag.findUnique({
      where: {
        pageId_tagId: {
          pageId,
          tagId,
        },
      },
    });

    if (existingPageTag) {
      throw new ConflictException('Tag already added to this page');
    }

    return this.prisma.pageTag.create({
      data: {
        pageId,
        tagId,
      },
      include: {
        tag: true,
      },
    });
  }

  /**
   * Remove tag from page
   */
  async removeTagFromPage(pageId: string, tagId: string, userId: string) {
    // Verify page belongs to user
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify tag belongs to user
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const pageTag = await this.prisma.pageTag.findUnique({
      where: {
        pageId_tagId: {
          pageId,
          tagId,
        },
      },
    });

    if (!pageTag) {
      throw new NotFoundException('Tag not found on this page');
    }

    await this.prisma.pageTag.delete({
      where: {
        pageId_tagId: {
          pageId,
          tagId,
        },
      },
    });

    return { message: 'Tag removed from page successfully' };
  }

  /**
   * Get tags for a specific page
   */
  async getPageTags(pageId: string, userId: string) {
    // Verify page belongs to user
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.pageTag.findMany({
      where: { pageId },
      include: {
        tag: true,
      },
      orderBy: {
        tag: {
          name: 'asc',
        },
      },
    });
  }
}

