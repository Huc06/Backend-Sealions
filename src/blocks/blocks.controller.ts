import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('blocks')
@UseGuards(SupabaseAuthGuard)
export class BlocksController {
  constructor(private blocksService: BlocksService) {}

  @Post()
  async create(@Request() req, @Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(req.user.id, createBlockDto);
  }

  @Get()
  async findAll(@Request() req, @Query('pageId') pageId: string) {
    return this.blocksService.findAll(pageId, req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.blocksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ) {
    return this.blocksService.update(id, req.user.id, updateBlockDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.blocksService.remove(id, req.user.id);
  }

  @Post('reorder')
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

