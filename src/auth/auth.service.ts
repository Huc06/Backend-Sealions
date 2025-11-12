import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
   * Helper to get Supabase client for additional operations
   */
  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}

