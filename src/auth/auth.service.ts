import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_KEY') || '',
    );
  }

  /**
   * Get or create user in our database based on Supabase auth user
   */
  async syncUser(supabaseUser: any) {
    const { id, email, user_metadata } = supabaseUser;

    let user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id,
          email,
          name: user_metadata?.name || user_metadata?.full_name || email.split('@')[0],
          avatar: user_metadata?.avatar_url || null,
        },
      });
    }

    return user;
  }

  /**
   * Register a new user with Supabase Auth
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.session || !data.user) {
      throw new BadRequestException(
        'Registration successful but email confirmation required. Please check your email or disable email confirmation in Supabase settings.',
      );
    }

    // Sync user to our database
    const user = await this.syncUser({
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata || {},
    });

    return {
      user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  /**
   * Login user with Supabase Auth
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.session || !data.user) {
      throw new UnauthorizedException('Login failed: No session created');
    }

    // Sync user to our database
    const user = await this.syncUser({
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata || {},
    });

    return {
      user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  /**
   * Helper to get Supabase client for additional operations
   */
  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}

