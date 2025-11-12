import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

  async findAll(userId: string) {
    const pages = await this.prisma.page.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        blocks: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return pages;
  }

  async findOne(id: string, userId: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: {
            position: 'asc',
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
    await this.findOne(id, userId);

    await this.prisma.page.delete({
      where: { id },
    });

    return { message: 'Page deleted successfully' };
  }
}

