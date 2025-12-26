import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBlockDto: CreateBlockDto) {
    // Verify page belongs to user
    const page = await this.prisma.page.findUnique({
      where: { id: createBlockDto.pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Create block
    const block = await this.prisma.block.create({
      data: {
        type: createBlockDto.type,
        content: createBlockDto.content,
        position: createBlockDto.position,
        pageId: createBlockDto.pageId,
      },
    });

    return block;
  }

  async findAll(pageId: string, userId: string, search?: string) {
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

    const blocks = await this.prisma.block.findMany({
      where: {
        pageId,
        isDeleted: false, // Exclude deleted blocks
      },
      orderBy: { position: 'asc' },
    });

    // Filter blocks by search term in content (JSON search)
    if (search) {
      const searchLower = search.toLowerCase();
      return blocks.filter((block) => {
        const contentStr = JSON.stringify(block.content).toLowerCase();
        return contentStr.includes(searchLower);
      });
    }

    return blocks;
  }

  async findOne(id: string, userId: string) {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    if (block.page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return block;
  }

  async update(id: string, userId: string, updateBlockDto: UpdateBlockDto) {
    // Check if block exists and belongs to user
    await this.findOne(id, userId);

    const block = await this.prisma.block.update({
      where: { id },
      data: updateBlockDto,
    });

    return block;
  }

  async remove(id: string, userId: string) {
    // Check if block exists and belongs to user
    const block = await this.findOne(id, userId);

    // Soft delete: mark as deleted
    await this.prisma.block.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Reorder remaining blocks (only non-deleted)
    await this.reorderAfterDelete(block.pageId, block.position);

    return { message: 'Block moved to trash successfully' };
  }

  /**
   * Restore a deleted block
   */
  async restore(id: string, userId: string) {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    if (block.page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!block.isDeleted) {
      throw new BadRequestException('Block is not deleted');
    }

    await this.prisma.block.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return { message: 'Block restored successfully' };
  }

  /**
   * Permanently delete a block
   */
  async permanentDelete(id: string, userId: string) {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    if (block.page.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!block.isDeleted) {
      throw new BadRequestException('Block must be in trash before permanent deletion');
    }

    const position = block.position;

    // Hard delete
    await this.prisma.block.delete({
      where: { id },
    });

    // Reorder remaining blocks
    await this.reorderAfterDelete(block.pageId, position);

    return { message: 'Block permanently deleted' };
  }

  async reorderBlocks(
    pageId: string,
    userId: string,
    reorderBlocksDto: ReorderBlocksDto,
  ) {
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

    // Update positions (only for non-deleted blocks)
    const updates = reorderBlocksDto.blockIds.map((blockId, index) =>
      this.prisma.block.update({
        where: {
          id: blockId,
          isDeleted: false,
        },
        data: { position: index },
      }),
    );

    await this.prisma.$transaction(updates);

    // Return updated blocks
    return this.findAll(pageId, userId);
  }

  private async reorderAfterDelete(pageId: string, deletedPosition: number) {
    // Get all non-deleted blocks after the deleted position
    const blocks = await this.prisma.block.findMany({
      where: {
        pageId,
        isDeleted: false,
        position: {
          gt: deletedPosition,
        },
      },
      orderBy: { position: 'asc' },
    });

    // Update their positions
    const updates = blocks.map((block) =>
      this.prisma.block.update({
        where: { id: block.id },
        data: { position: block.position - 1 },
      }),
    );

    await this.prisma.$transaction(updates);
  }
}

