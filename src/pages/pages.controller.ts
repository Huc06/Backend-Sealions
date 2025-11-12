import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('pages')
@UseGuards(SupabaseAuthGuard)
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Post()
  async create(@Request() req, @Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(req.user.id, createPageDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.pagesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pagesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, req.user.id, updatePageDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.pagesService.remove(id, req.user.id);
  }
}

