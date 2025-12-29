import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { PasswordReminderService } from './password-reminder.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordReminderService: PasswordReminderService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User registered successfully and token returned',
    schema: {
      example: {
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
          name: 'John Doe',
          avatar: null,
          createdAt: '2025-11-12T08:02:06.513Z',
          updatedAt: '2025-11-12T08:02:06.513Z',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImxzamZFRjdUN2Y3NnlBK1AiLCJ0eXAiOiJKV1QifQ...',
        refresh_token: 'v1.xxx...',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input or email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    // Update password changed date when user registers
    await this.passwordReminderService.updatePasswordChangedDate(result.user.id);
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get access token' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful, token returned',
    schema: {
      example: {
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
          name: 'John Doe',
          avatar: null,
          createdAt: '2025-11-12T08:02:06.513Z',
          updatedAt: '2025-11-12T08:02:06.513Z',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImxzamZFRjdUN2Y3NnlBK1AiLCJ0eXAiOiJKV1QifQ...',
        refresh_token: 'v1.xxx...',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({
    description: 'Authenticated user info synced from Supabase',
    schema: {
      example: {
        user: {
          id: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
          email: 'user@example.com',
          name: 'User Name',
          avatar: 'https://example.com/avatar.png',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard)
  async getCurrentUser(@Request() req) {
    try {
      const user = await this.authService.syncUser({
        id: req.user.id,
        email: req.user.email,
        user_metadata: req.user.user_metadata || {},
      });
      return { user };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change user password (updates passwordChangedAt)',
    description: 'Call this endpoint after user successfully changes password in Supabase. This updates the passwordChangedAt timestamp for reminder tracking.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: {
          type: 'string',
          description: 'New password (for validation only, actual change happens in Supabase)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Password change recorded successfully',
    schema: {
      example: {
        message: 'Password change recorded successfully',
        passwordChangedAt: '2025-12-29T10:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard)
  async changePassword(@Request() req) {
    // Note: Actual password change should happen in Supabase
    // This endpoint just records that password was changed
    await this.passwordReminderService.updatePasswordChangedDate(req.user.id);
    return {
      message: 'Password change recorded successfully',
      passwordChangedAt: new Date(),
    };
  }

  @Get('password-reminder')
  @ApiOperation({
    summary: 'Check password reminder status',
    description: 'Check if user needs to change password. Password should be changed every 90 days for security.',
  })
  @ApiOkResponse({
    description: 'Password reminder status',
    schema: {
      example: {
        needsReminder: false,
        daysSinceChange: 30,
        daysUntilExpiry: 60,
        reminderLevel: 'none',
        message: '✅ Your password was changed 30 days ago.',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(SupabaseAuthGuard)
  async getPasswordReminder(@Request() req) {
    const status = await this.passwordReminderService.checkReminderStatus(
      req.user.id,
    );
    
    // Mark reminder as sent if needed
    if (status.needsReminder) {
      await this.passwordReminderService.markReminderSent(req.user.id);
    }
    
    return status;
  }
}
