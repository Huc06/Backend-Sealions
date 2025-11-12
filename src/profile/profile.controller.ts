import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('profile')
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }
}

