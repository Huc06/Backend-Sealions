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
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Comments')
@Controller('comments')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post('blocks/:blockId')
  @ApiOperation({ summary: 'Create a comment on a block' })
  @ApiParam({ name: 'blockId', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({
    description: 'Comment created successfully',
    schema: {
      example: {
        id: 'cmhvc1234000012gmbwreufjj4',
        content: 'This is a great idea!',
        blockId: 'cmhvpvb3j00072gmbnz1dl3jc',
        userId: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        parentId: null,
        createdAt: '2025-11-12T08:02:06.513Z',
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
          name: 'User Name',
        },
        replies: [],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input or parent comment mismatch' })
  @ApiNotFoundResponse({ description: 'Block or parent comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no permission' })
  async create(
    @Request() req,
    @Param('blockId') blockId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(blockId, req.user.id, createCommentDto);
  }

  @Get('blocks/:blockId')
  @ApiOperation({ summary: 'Get all comments for a block' })
  @ApiParam({ name: 'blockId', description: 'Block ID', example: 'cmhvpvb3j00072gmbnz1dl3jc' })
  @ApiOkResponse({
    description: 'List of comments (threaded)',
    schema: {
      example: [
        {
          id: 'cmhvc1234000012gmbwreufjj4',
          content: 'This is a great idea!',
          createdAt: '2025-11-12T08:02:06.513Z',
          user: {
            id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
            email: 'user@example.com',
            name: 'User Name',
          },
          replies: [
            {
              id: 'cmhvc1234000013gmbwreufjj5',
              content: 'I agree!',
              user: {
                id: 'another-user-id',
                email: 'another@example.com',
                name: 'Another User',
              },
            },
          ],
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no permission' })
  async findAll(@Request() req, @Param('blockId') blockId: string) {
    return this.commentsService.findAll(blockId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 'cmhvc1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Comment details',
    schema: {
      example: {
        id: 'cmhvc1234000012gmbwreufjj4',
        content: 'This is a great idea!',
        blockId: 'cmhvpvb3j00072gmbnz1dl3jc',
        userId: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        parentId: null,
        createdAt: '2025-11-12T08:02:06.513Z',
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
          name: 'User Name',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or no permission' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.commentsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 'cmhvc1234000012gmbwreufjj4' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiOkResponse({
    description: 'Comment updated successfully',
    schema: {
      example: {
        id: 'cmhvc1234000012gmbwreufjj4',
        content: 'Updated comment text',
        updatedAt: '2025-11-12T08:08:06.513Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or not comment owner' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user.id, updateCommentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 'cmhvc1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'Comment deleted successfully',
    schema: { example: { message: 'Comment deleted successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or not comment owner/page owner' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.commentsService.remove(id, req.user.id);
  }
}

