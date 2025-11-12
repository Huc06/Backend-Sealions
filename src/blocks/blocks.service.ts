import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

  async findAll(pageId: string, userId: string) {
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
      where: { pageId },
      orderBy: { position: 'asc' },
    });

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

    await this.prisma.block.delete({
      where: { id },
    });

    // Reorder remaining blocks
    await this.reorderAfterDelete(block.pageId, block.position);

    return { message: 'Block deleted successfully' };
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

    // Update positions
    const updates = reorderBlocksDto.blockIds.map((blockId, index) =>
      this.prisma.block.update({
        where: { id: blockId },
        data: { position: index },
      }),
    );

    await this.prisma.$transaction(updates);

    // Return updated blocks
    return this.findAll(pageId, userId);
  }

  private async reorderAfterDelete(pageId: string, deletedPosition: number) {
    // Get all blocks after the deleted position
    const blocks = await this.prisma.block.findMany({
      where: {
        pageId,
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

