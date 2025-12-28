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
  ApiConflictResponse,
} from '@nestjs/swagger';
import { SharingService } from './sharing.service';
import { SharePageDto, UpdateSharePermissionDto } from './dto/share-page.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Sharing')
@Controller('sharing')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class SharingController {
  constructor(private sharingService: SharingService) {}

  @Post('pages/:pageId/share')
  @ApiOperation({ summary: 'Share a page with another user' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiBody({ type: SharePageDto })
  @ApiCreatedResponse({
    description: 'Page shared successfully',
    schema: {
      example: {
        id: 'cmhvs1234000012gmbwreufjj4',
        pageId: 'cmhvq1234000012gmbwreufjj4',
        sharedWith: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        permission: 'VIEW',
        createdAt: '2025-11-12T08:02:06.513Z',
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
          name: 'User Name',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Page already shared with this user' })
  @ApiBadRequestResponse({ description: 'Cannot share with yourself' })
  @ApiNotFoundResponse({ description: 'Page or user not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async sharePage(
    @Request() req,
    @Param('pageId') pageId: string,
    @Body() sharePageDto: SharePageDto,
  ) {
    return this.sharingService.sharePage(pageId, req.user.id, sharePageDto);
  }

  @Get('pages/shared-with-me')
  @ApiOperation({ summary: 'Get all pages shared with me' })
  @ApiOkResponse({
    description: 'List of pages shared with current user',
    schema: {
      example: [
        {
          id: 'cmhvs1234000012gmbwreufjj4',
          permission: 'VIEW',
          page: {
            id: 'cmhvq1234000012gmbwreufjj4',
            title: 'Shared Page',
            user: {
              id: 'owner-id',
              email: 'owner@example.com',
              name: 'Owner Name',
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getSharedWithMe(@Request() req) {
    return this.sharingService.getSharedWithMe(req.user.id);
  }

  @Get('pages/shared-by-me')
  @ApiOperation({ summary: 'Get all pages I have shared' })
  @ApiOkResponse({
    description: 'List of pages shared by current user',
    schema: {
      example: [
        {
          id: 'cmhvs1234000012gmbwreufjj4',
          permission: 'VIEW',
          user: {
            id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
            email: 'user@example.com',
            name: 'User Name',
          },
          page: {
            id: 'cmhvq1234000012gmbwreufjj4',
            title: 'My Page',
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getSharedByMe(@Request() req) {
    return this.sharingService.getSharedByMe(req.user.id);
  }

  @Get('pages/:pageId/shares')
  @ApiOperation({ summary: 'Get all users who have access to a page' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiOkResponse({
    description: 'List of shares for the page',
    schema: {
      example: [
        {
          id: 'cmhvs1234000012gmbwreufjj4',
          sharedWith: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          permission: 'VIEW',
          user: {
            id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
            email: 'user@example.com',
            name: 'User Name',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Page not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPageShares(@Request() req, @Param('pageId') pageId: string) {
    return this.sharingService.getPageShares(pageId, req.user.id);
  }

  @Patch('pages/:pageId/share/:userId')
  @ApiOperation({ summary: 'Update permission for a shared page' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '4f4694b9-dd4c-435e-a931-2ea5b05add8e' })
  @ApiBody({ type: UpdateSharePermissionDto })
  @ApiOkResponse({
    description: 'Permission updated successfully',
    schema: {
      example: {
        id: 'cmhvs1234000012gmbwreufjj4',
        permission: 'EDIT',
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Page or share not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updatePermission(
    @Request() req,
    @Param('pageId') pageId: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateSharePermissionDto,
  ) {
    return this.sharingService.updatePermission(
      pageId,
      userId,
      req.user.id,
      updateDto,
    );
  }

  @Delete('pages/:pageId/share/:userId')
  @ApiOperation({ summary: 'Unshare a page (remove access)' })
  @ApiParam({ name: 'pageId', description: 'Page ID', example: 'cmhvq1234000012gmbwreufjj4' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '4f4694b9-dd4c-435e-a931-2ea5b05add8e' })
  @ApiOkResponse({
    description: 'Page unshared successfully',
    schema: { example: { message: 'Page unshared successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Page or share not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async unsharePage(
    @Request() req,
    @Param('pageId') pageId: string,
    @Param('userId') userId: string,
  ) {
    return this.sharingService.unsharePage(pageId, userId, req.user.id);
  }
}



