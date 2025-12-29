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
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Blocks')
@Controller('blocks')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class BlocksController {
  constructor(private blocksService: BlocksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a block',
    description: `
Create different types of blocks:
- **TEXT**: Plain text with optional formatting
- **HEADING**: Headings with levels (1, 2, 3)
- **CHECKLIST**: Todo lists with checkable items
- **IMAGE**: Images with URLs and captions
- **FILE**: File attachments (PDFs, documents, etc.)

See examples in the request body below.
    `,
  })
  @ApiBody({
    type: CreateBlockDto,
    examples: {
      textBlock: {
        summary: 'Text Block',
        description: 'Create a text block with optional formatting',
        value: {
          type: 'TEXT',
          content: { text: 'Hello World', bold: false, italic: false },
          pageId: 'cmhvq1234000012gmbwreufjj4',
          position: 0,
        },
      },
      headingBlock: {
        summary: 'Heading Block',
        description: 'Create a heading block (H1, H2, or H3)',
        value: {
          type: 'HEADING',
          content: { text: 'My Heading', level: 1 },
          pageId: 'cmhvq1234000012gmbwreufjj4',
          position: 1,
        },
      },
      checklistBlock: {
        summary: 'Checklist Block',
        description: 'Create a checklist with multiple items',
        value: {
          type: 'CHECKLIST',
          content: {
            items: [
              { text: 'Task 1', checked: false },
              { text: 'Task 2', checked: true },
              { text: 'Task 3', checked: false },
            ],
          },
          pageId: 'cmhvq1234000012gmbwreufjj4',
          position: 2,
        },
      },
      imageBlock: {
        summary: 'Image Block',
        description: 'Create an image block with URL and optional caption',
        value: {
          type: 'IMAGE',
          content: {
            url: 'https://example.com/image.jpg',
            caption: 'My beautiful image',
            alt: 'Image description',
          },
          pageId: 'cmhvq1234000012gmbwreufjj4',
          position: 3,
        },
      },
      fileBlock: {
        summary: 'File Block',
        description: 'Create a file block (PDF, document, etc.)',
        value: {
          type: 'FILE',
          content: {
            url: 'https://res.cloudinary.com/cloud/image/upload/v123/file.pdf',
            name: 'document.pdf',
            type: 'pdf',
            size: 1024000,
          },
          pageId: 'cmhvq1234000012gmbwreufjj4',
          position: 4,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Created block (response format is the same for all block types)',
    schema: {
      examples: {
        textBlock: {
          value: {
            id: 'cmhvpvb3j00072gmbnz1dl3jc',
            type: 'TEXT',
            content: { text: 'Hello World', bold: false },
            position: 0,
            pageId: 'cmhvq1234000012gmbwreufjj4',
            createdAt: '2025-11-12T08:06:52.400Z',
            updatedAt: '2025-11-12T08:06:52.400Z',
          },
        },
        headingBlock: {
          value: {
            id: 'cmhvpvb3j00073gmbnz1dl3jd',
            type: 'HEADING',
            content: { text: 'My Heading', level: 1 },
            position: 1,
            pageId: 'cmhvq1234000012gmbwreufjj4',
            createdAt: '2025-11-12T08:06:52.400Z',
            updatedAt: '2025-11-12T08:06:52.400Z',
          },
        },
        checklistBlock: {
          value: {
            id: 'cmhvpvb3j00074gmbnz1dl3je',
            type: 'CHECKLIST',
            content: {
              items: [
                { text: 'Task 1', checked: false },
                { text: 'Task 2', checked: true },
              ],
            },
            position: 2,
            pageId: 'cmhvq1234000012gmbwreufjj4',
            createdAt: '2025-11-12T08:06:52.400Z',
            updatedAt: '2025-11-12T08:06:52.400Z',
          },
        },
        imageBlock: {
          value: {
            id: 'cmhvpvb3j00075gmbnz1dl3jf',
            type: 'IMAGE',
            content: {
              url: 'https://example.com/image.jpg',
              caption: 'My beautiful image',
            },
            position: 3,
            pageId: 'cmhvq1234000012gmbwreufjj4',
            createdAt: '2025-11-12T08:06:52.400Z',
            updatedAt: '2025-11-12T08:06:52.400Z',
          },
        },
        fileBlock: {
          value: {
            id: 'cmhvpvb3j00076gmbnz1dl3jg',
            type: 'FILE',
            content: {
              url: 'https://res.cloudinary.com/cloud/image/upload/v123/file.pdf',
              name: 'document.pdf',
              type: 'pdf',
              size: 1024000,
            },
            position: 4,
            pageId: 'cmhvq1234000012gmbwreufjj4',
            createdAt: '2025-11-12T08:06:52.400Z',
            updatedAt: '2025-11-12T08:06:52.400Z',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Request() req, @Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(req.user.id, createBlockDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List blocks in a page with optional search',
    description: 'Returns all blocks for a page. Can include different block types: TEXT, HEADING, CHECKLIST, IMAGE, FILE',
  })
  @ApiQuery({ name: 'pageId', required: true, description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter blocks by content', example: 'hello' })
  @ApiOkResponse({
    description: 'List of blocks (can include multiple block types)',
    schema: {
      example: [
        {
          id: 'cmhvpvb3j00072gmbnz1dl3jc',
          type: 'TEXT',
          content: { text: 'Hello', bold: false },
          position: 0,
          pageId: 'cmhvq1234000012gmbwreufjj4',
        },
        {
          id: 'cmhvpvb3j00073gmbnz1dl3jd',
          type: 'HEADING',
          content: { text: 'My Heading', level: 1 },
          position: 1,
          pageId: 'cmhvq1234000012gmbwreufjj4',
        },
        {
          id: 'cmhvpvb3j00074gmbnz1dl3je',
          type: 'CHECKLIST',
          content: {
            items: [
              { text: 'Task 1', checked: false },
              { text: 'Task 2', checked: true },
            ],
          },
          position: 2,
          pageId: 'cmhvq1234000012gmbwreufjj4',
        },
        {
          id: 'cmhvpvb3j00075gmbnz1dl3jf',
          type: 'IMAGE',
          content: {
            url: 'https://example.com/image.jpg',
            caption: 'My image',
          },
          position: 3,
          pageId: 'cmhvq1234000012gmbwreufjj4',
        },
        {
          id: 'cmhvpvb3j00076gmbnz1dl3jg',
          type: 'FILE',
          content: {
            url: 'https://res.cloudinary.com/cloud/image/upload/v123/file.pdf',
            name: 'document.pdf',
            type: 'pdf',
            size: 1024000,
          },
          position: 4,
          pageId: 'cmhvq1234000012gmbwreufjj4',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @Request() req,
    @Query('pageId') pageId: string,
    @Query('search') search?: string,
  ) {
    return this.blocksService.findAll(pageId, req.user.id, search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get block by ID',
    description: 'Returns a single block. Block can be any type: TEXT, HEADING, CHECKLIST, IMAGE, or FILE',
  })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'Block detail (format depends on block type)',
    schema: {
      examples: {
        textBlock: {
          summary: 'Text Block',
          value: {
            id: 'cmhvpvb3j00072gmbnz1dl3jc',
            type: 'TEXT',
            content: { text: 'Hello', bold: false },
            position: 0,
            pageId: 'cmhvq1234000012gmbwreufjj4',
          },
        },
        headingBlock: {
          summary: 'Heading Block',
          value: {
            id: 'cmhvpvb3j00073gmbnz1dl3jd',
            type: 'HEADING',
            content: { text: 'My Heading', level: 1 },
            position: 1,
            pageId: 'cmhvq1234000012gmbwreufjj4',
          },
        },
        checklistBlock: {
          summary: 'Checklist Block',
          value: {
            id: 'cmhvpvb3j00074gmbnz1dl3je',
            type: 'CHECKLIST',
            content: {
              items: [
                { text: 'Task 1', checked: false },
                { text: 'Task 2', checked: true },
              ],
            },
            position: 2,
            pageId: 'cmhvq1234000012gmbwreufjj4',
          },
        },
        imageBlock: {
          summary: 'Image Block',
          value: {
            id: 'cmhvpvb3j00075gmbnz1dl3jf',
            type: 'IMAGE',
            content: {
              url: 'https://example.com/image.jpg',
              caption: 'My image',
            },
            position: 3,
            pageId: 'cmhvq1234000012gmbwreufjj4',
          },
        },
        fileBlock: {
          summary: 'File Block',
          value: {
            id: 'cmhvpvb3j00076gmbnz1dl3jg',
            type: 'FILE',
            content: {
              url: 'https://res.cloudinary.com/cloud/image/upload/v123/file.pdf',
              name: 'document.pdf',
              type: 'pdf',
              size: 1024000,
            },
            position: 4,
            pageId: 'cmhvq1234000012gmbwreufjj4',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.blocksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a block' })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiBody({ type: UpdateBlockDto })
  @ApiOkResponse({
    description: 'Updated block data',
    schema: {
      example: {
        id: 'cmhvpvb3j00072gmbnz1dl3jc',
        type: 'TEXT',
        content: { text: 'Updated', bold: true },
        position: 0,
        pageId: 'cmhvq1234000012gmbwreufjj4',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ) {
    return this.blocksService.update(id, req.user.id, updateBlockDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a block (moves to trash)' })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'Block moved to trash',
    schema: { example: { message: 'Block moved to trash successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.blocksService.remove(id, req.user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a deleted block from trash' })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'Block restored successfully',
    schema: { example: { message: 'Block restored successfully' } },
  })
  @ApiBadRequestResponse({ description: 'Block is not deleted' })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async restore(@Request() req, @Param('id') id: string) {
    return this.blocksService.restore(id, req.user.id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete a block (must be in trash)' })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'Block permanently deleted',
    schema: { example: { message: 'Block permanently deleted' } },
  })
  @ApiBadRequestResponse({ description: 'Block must be in trash' })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async permanentDelete(@Request() req, @Param('id') id: string) {
    return this.blocksService.permanentDelete(id, req.user.id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder blocks within a page' })
  @ApiQuery({ name: 'pageId', required: true, description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiBody({ type: ReorderBlocksDto })
  @ApiOkResponse({
    description: 'Reordered blocks list',
    schema: {
      example: [
        {
          id: 'cmhvpvb3j00072gmbnz1dl3jc',
          position: 0,
        },
        {
          id: 'cmhvpvb3j00082gmbnz1dl3jd',
          position: 1,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async reorder(
    @Request() req,
    @Query('pageId') pageId: string,
    @Body() reorderBlocksDto: ReorderBlocksDto,
  ) {
    return this.blocksService.reorderBlocks(
      pageId,
      req.user.id,
      reorderBlocksDto,
    );
  }
}

