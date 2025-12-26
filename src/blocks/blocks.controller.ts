import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
  @ApiOperation({ summary: 'Create a block' })
  @ApiBody({ type: CreateBlockDto })
  @ApiCreatedResponse({
    description: 'Created block',
    schema: {
      example: {
        id: 'cmhvpvb3j00072gmbnz1dl3jc',
        type: 'TEXT',
        content: { text: 'Hello', bold: false },
        position: 0,
        pageId: 'cmhvq1234000012gmbwreufjj4',
        createdAt: '2025-11-12T08:06:52.400Z',
        updatedAt: '2025-11-12T08:06:52.400Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Request() req, @Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(req.user.id, createBlockDto);
  }

  @Get()
  @ApiOperation({ summary: 'List blocks in a page with optional search' })
  @ApiQuery({ name: 'pageId', required: true, description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter blocks by content', example: 'hello' })
  @ApiOkResponse({
    description: 'List of blocks',
    schema: {
      example: [
        {
          id: 'cmhvpvb3j00072gmbnz1dl3jc',
          type: 'TEXT',
          content: { text: 'Hello', bold: false },
          position: 0,
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
  @ApiOperation({ summary: 'Get block by ID' })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'Block detail',
    schema: {
      example: {
        id: 'cmhvpvb3j00072gmbnz1dl3jc',
        type: 'TEXT',
        content: { text: 'Hello', bold: false },
        position: 0,
        pageId: 'cmhvq1234000012gmbwreufjj4',
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
  @ApiOperation({ summary: 'Delete a block' })
  @ApiParam({ name: 'id', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'Block deleted confirmation',
    schema: { example: { message: 'Block deleted successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.blocksService.remove(id, req.user.id);
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

