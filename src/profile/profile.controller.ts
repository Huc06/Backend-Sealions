import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({
    description: 'Returns the authenticated user profile',
    schema: {
      example: {
        id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        email: 'user@example.com',
        name: 'User Name',
        avatar: 'https://example.com/avatar.png',
        createdAt: '2025-11-12T08:02:06.513Z',
        updatedAt: '2025-11-12T08:07:25.498Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'Updated profile data',
    schema: {
      example: {
        id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
        email: 'user@example.com',
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2025-11-12T08:02:06.513Z',
        updatedAt: '2025-11-12T08:07:25.498Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }
}

