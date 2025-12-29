import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SharePageDto, Permission, UpdateSharePermissionDto } from './dto/share-page.dto';

@Injectable()
export class SharingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Share a page with another user (by userId or email)
   */
  async sharePage(
    pageId: string,
    ownerId: string,
    sharePageDto: SharePageDto,
  ) {
    // Verify page exists and belongs to owner
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== ownerId) {
      throw new ForbiddenException('Only page owner can share the page');
    }

    // Find target user by userId or email
    let targetUser;
    if (sharePageDto.userId) {
      targetUser = await this.prisma.user.findUnique({
        where: { id: sharePageDto.userId },
      });
    } else if (sharePageDto.email) {
      targetUser = await this.prisma.user.findUnique({
        where: { email: sharePageDto.email },
      });
    } else {
      throw new BadRequestException('Either userId or email must be provided');
    }

    if (!targetUser) {
      throw new NotFoundException(
        sharePageDto.email
          ? `User with email ${sharePageDto.email} not found`
          : 'User not found',
      );
    }

    // Cannot share with yourself
    if (targetUser.id === ownerId) {
      throw new BadRequestException('Cannot share page with yourself');
    }

    // Check if already shared
    const existingShare = await this.prisma.pageShare.findUnique({
      where: {
        pageId_sharedWith: {
          pageId,
          sharedWith: targetUser.id,
        },
      },
    });

    if (existingShare) {
      throw new ConflictException('Page already shared with this user');
    }

    // Create share
    return this.prisma.pageShare.create({
      data: {
        pageId,
        sharedWith: targetUser.id,
        permission: sharePageDto.permission,
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
        page: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Get all pages shared with the current user
   */
  async getSharedWithMe(userId: string) {
    return this.prisma.pageShare.findMany({
      where: {
        sharedWith: userId,
        page: {
          isDeleted: false,
        },
      },
      include: {
        page: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
            blocks: {
              where: { isDeleted: false },
              orderBy: { position: 'asc' },
            },
            pageTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all pages shared by the current user
   */
  async getSharedByMe(userId: string) {
    return this.prisma.pageShare.findMany({
      where: {
        page: {
          userId,
          isDeleted: false,
        },
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
        page: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update permission for a shared page
   */
  async updatePermission(
    pageId: string,
    sharedWith: string,
    ownerId: string,
    updateDto: UpdateSharePermissionDto,
  ) {
    // Verify page belongs to owner
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== ownerId) {
      throw new ForbiddenException('Only page owner can update permissions');
    }

    // Verify share exists
    const share = await this.prisma.pageShare.findUnique({
      where: {
        pageId_sharedWith: {
          pageId,
          sharedWith,
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Update permission
    return this.prisma.pageShare.update({
      where: {
        pageId_sharedWith: {
          pageId,
          sharedWith,
        },
      },
      data: {
        permission: updateDto.permission,
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
      },
    });
  }

  /**
   * Unshare a page (remove share)
   */
  async unsharePage(pageId: string, sharedWith: string, ownerId: string) {
    // Verify page belongs to owner
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== ownerId) {
      throw new ForbiddenException('Only page owner can unshare the page');
    }

    // Verify share exists
    const share = await this.prisma.pageShare.findUnique({
      where: {
        pageId_sharedWith: {
          pageId,
          sharedWith,
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Delete share
    await this.prisma.pageShare.delete({
      where: {
        pageId_sharedWith: {
          pageId,
          sharedWith,
        },
      },
    });

    return { message: 'Page unshared successfully' };
  }

  /**
   * Check if user has permission to access a page
   */
  async checkPermission(
    pageId: string,
    userId: string,
    requiredPermission: Permission,
  ): Promise<boolean> {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      include: {
        shares: true,
      },
    });

    if (!page) {
      return false;
    }

    // Owner has all permissions
    if (page.userId === userId) {
      return true;
    }

    // Check if page is shared with user
    const share = page.shares.find((s) => s.sharedWith === userId);
    if (!share) {
      return false;
    }

    // Check permission level
    const permissionHierarchy = {
      VIEW: 1,
      COMMENT: 2,
      EDIT: 3,
    };

    return (
      permissionHierarchy[share.permission] >=
      permissionHierarchy[requiredPermission]
    );
  }

  /**
   * Get users who have access to a page
   */
  async getPageShares(pageId: string, ownerId: string) {
    // Verify page belongs to owner
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.userId !== ownerId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.pageShare.findMany({
      where: { pageId },
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
        createdAt: 'desc',
      },
    });
  }
}



