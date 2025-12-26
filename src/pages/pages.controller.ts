import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Pages')
@Controller('pages')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new page' })
  @ApiBody({ type: CreatePageDto })
  @ApiCreatedResponse({
    description: 'Created page',
    schema: {
      example: {
        id: 'cmhvq1234000012gmbwreufjj4',
        title: 'My Page',
        userId: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        createdAt: '2025-11-12T08:06:31.943Z',
        updatedAt: '2025-11-12T08:06:31.943Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Request() req, @Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(req.user.id, createPageDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all pages of authenticated user with search and filter' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search pages by title',
    example: 'meeting',
  })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    description: 'Filter by tag IDs (comma-separated)',
    example: 'cmhvt1234000012gmbwreufjj4,cmhvt1234000013gmbwreufjj5',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['updatedAt', 'createdAt', 'title'],
    example: 'updatedAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiOkResponse({
    description: 'List of pages',
    schema: {
      example: [
        {
          id: 'cmhvq1234000012gmbwreufjj4',
          title: 'My Page',
          createdAt: '2025-11-12T08:06:31.943Z',
          updatedAt: '2025-11-12T08:06:31.943Z',
          pageTags: [
            {
              tag: {
                id: 'cmhvt1234000012gmbwreufjj4',
                name: 'work',
              },
            },
          ],
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('tagIds') tagIds?: string,
    @Query('sortBy') sortBy?: 'updatedAt' | 'createdAt' | 'title',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const tagIdsArray = tagIds ? tagIds.split(',').filter(Boolean) : undefined;
    return this.pagesService.findAll(req.user.id, {
      search,
      tagIds: tagIdsArray,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  @ApiParam({ name: 'id', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Page detail',
    schema: {
      example: {
        id: 'cmhvq1234000012gmbwreufjj4',
        title: 'My Page',
        createdAt: '2025-11-12T08:06:31.943Z',
        updatedAt: '2025-11-12T08:06:31.943Z',
        blocks: [],
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pagesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update page title' })
  @ApiParam({ name: 'id', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiBody({ type: UpdatePageDto })
  @ApiOkResponse({
    description: 'Updated page',
    schema: {
      example: {
        id: 'cmhvq1234000012gmbwreufjj4',
        title: 'Updated title',
        createdAt: '2025-11-12T08:06:31.943Z',
        updatedAt: '2025-11-12T08:08:31.943Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, req.user.id, updatePageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a page (moves to trash)' })
  @ApiParam({ name: 'id', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Page moved to trash',
    schema: { example: { message: 'Page moved to trash successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.pagesService.remove(id, req.user.id);
  }

  @Get('trash')
  @ApiOperation({ summary: 'Get all deleted pages (trash)' })
  @ApiOkResponse({
    description: 'List of deleted pages',
    schema: {
      example: [
        {
          id: 'cmhvq1234000012gmbwreufjj4',
          title: 'Deleted Page',
          isDeleted: true,
          deletedAt: '2025-11-12T08:06:31.943Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getTrash(@Request() req) {
    return this.pagesService.getTrash(req.user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a deleted page from trash' })
  @ApiParam({ name: 'id', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Page restored successfully',
    schema: { example: { message: 'Page restored successfully' } },
  })
  @ApiBadRequestResponse({ description: 'Page is not deleted' })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async restore(@Request() req, @Param('id') id: string) {
    return this.pagesService.restore(id, req.user.id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete a page (must be in trash)' })
  @ApiParam({ name: 'id', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Page permanently deleted',
    schema: { example: { message: 'Page permanently deleted' } },
  })
  @ApiBadRequestResponse({ description: 'Page must be in trash' })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async permanentDelete(@Request() req, @Param('id') id: string) {
    return this.pagesService.permanentDelete(id, req.user.id);
  }
}

