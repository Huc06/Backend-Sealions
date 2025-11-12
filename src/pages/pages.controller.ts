import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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
  @ApiOperation({ summary: 'List all pages of authenticated user' })
  @ApiOkResponse({
    description: 'List of pages',
    schema: {
      example: [
        {
          id: 'cmhvq1234000012gmbwreufjj4',
          title: 'My Page',
          createdAt: '2025-11-12T08:06:31.943Z',
          updatedAt: '2025-11-12T08:06:31.943Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.pagesService.findAll(req.user.id);
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
  @ApiOperation({ summary: 'Delete a page' })
  @ApiParam({ name: 'id', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Page deleted confirmation',
    schema: { example: { message: 'Page deleted successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.pagesService.remove(id, req.user.id);
  }
}

