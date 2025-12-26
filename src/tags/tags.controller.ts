import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiCreatedResponse({
    description: 'Tag created successfully',
    schema: {
      example: {
        id: 'cmhvt1234000012gmbwreufjj4',
        name: 'work',
        userId: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        createdAt: '2025-11-12T08:02:06.513Z',
      },
    },
  })
  @ApiConflictResponse({ description: 'Tag already exists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Request() req, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.id, createTagDto.name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags for authenticated user' })
  @ApiOkResponse({
    description: 'List of tags',
    schema: {
      example: [
        {
          id: 'cmhvt1234000012gmbwreufjj4',
          name: 'work',
          userId: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          createdAt: '2025-11-12T08:02:06.513Z',
          _count: {
            pageTags: 5,
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.tagsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID', example: 'cmhvt1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Tag details',
    schema: {
      example: {
        id: 'cmhvt1234000012gmbwreufjj4',
        name: 'work',
        userId: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        createdAt: '2025-11-12T08:02:06.513Z',
        _count: {
          pageTags: 5,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.tagsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID', example: 'cmhvt1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Tag deleted successfully',
    schema: {
      example: {
        message: 'Tag deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.tagsService.remove(id, req.user.id);
  }

  @Post('pages/:pageId/tags/:tagId')
  @ApiOperation({ summary: 'Add tag to a page' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiParam({ name: 'tagId', description: 'Tag ID', example: 'cmhvt1234000012gmbwreufjj4' })
  @ApiCreatedResponse({
    description: 'Tag added to page successfully',
    schema: {
      example: {
        pageId: 'cmhvq1234000012gmbwreufjj4',
        tagId: 'cmhvt1234000012gmbwreufjj4',
        createdAt: '2025-11-12T08:02:06.513Z',
        tag: {
          id: 'cmhvt1234000012gmbwreufjj4',
          name: 'work',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Tag already added to this page' })
  @ApiNotFoundResponse({ description: 'Page or tag not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async addTagToPage(
    @Request() req,
    @Param('pageId') pageId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagsService.addTagToPage(pageId, tagId, req.user.id);
  }

  @Delete('pages/:pageId/tags/:tagId')
  @ApiOperation({ summary: 'Remove tag from a page' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiParam({ name: 'tagId', description: 'Tag ID', example: 'cmhvt1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Tag removed from page successfully',
    schema: {
      example: {
        message: 'Tag removed from page successfully',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Page, tag, or relation not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async removeTagFromPage(
    @Request() req,
    @Param('pageId') pageId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagsService.removeTagFromPage(pageId, tagId, req.user.id);
  }

  @Get('pages/:pageId')
  @ApiOperation({ summary: 'Get all tags for a specific page' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'List of tags for the page',
    schema: {
      example: [
        {
          pageId: 'cmhvq1234000012gmbwreufjj4',
          tagId: 'cmhvt1234000012gmbwreufjj4',
          createdAt: '2025-11-12T08:02:06.513Z',
          tag: {
            id: 'cmhvt1234000012gmbwreufjj4',
            name: 'work',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPageTags(@Request() req, @Param('pageId') pageId: string) {
    return this.tagsService.getPageTags(pageId, req.user.id);
  }
}

