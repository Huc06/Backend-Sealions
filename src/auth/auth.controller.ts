import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    return this.authService.register(registerDto);
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
      // req.user is already validated by Supabase strategy
      // Sync with our database
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
}

