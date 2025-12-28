import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { SharingService } from '../sharing/sharing.service';
import { Permission } from '../sharing/dto/share-page.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private sharingService: SharingService,
  ) {}

  /**
   * Create a comment on a block
   */
  async create(blockId: string, userId: string, createCommentDto: CreateCommentDto) {
    // Verify block exists
    const block = await this.prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Check permission (user must have COMMENT or EDIT permission)
    const hasPermission = await this.sharingService.checkPermission(
      block.pageId,
      userId,
      Permission.COMMENT,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to comment on this page');
    }

    // If parentId is provided, verify parent comment exists and belongs to same block
    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.blockId !== blockId) {
        throw new BadRequestException('Parent comment must be on the same block');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        blockId,
        userId,
        parentId: createCommentDto.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get all comments for a block
   */
  async findAll(blockId: string, userId: string) {
    // Verify block exists
    const block = await this.prisma.block.findUnique({
      where: { id: blockId },
      include: { page: true },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Check permission (user must have VIEW permission at minimum)
    const hasPermission = await this.sharingService.checkPermission(
      block.pageId,
      userId,
      Permission.VIEW,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to view this page');
    }

    // Get top-level comments (no parent) with replies
    return this.prisma.comment.findMany({
      where: {
        blockId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get a single comment
   */
  async findOne(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        block: {
          include: {
            page: true,
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
        replies: {
          include: {
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

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check permission
    const hasPermission = await this.sharingService.checkPermission(
      comment.block.pageId,
      userId,
      Permission.VIEW,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to view this comment');
    }

    return comment;
  }

  /**
   * Update a comment
   */
  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only comment author can update
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
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
  }

  /**
   * Delete a comment
   */
  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        block: {
          include: {
            page: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Comment author or page owner can delete
    const isOwner = comment.userId === userId;
    const isPageOwner = comment.block.page.userId === userId;

    if (!isOwner && !isPageOwner) {
      throw new ForbiddenException('You can only delete your own comments or be the page owner');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully' };
  }
}

