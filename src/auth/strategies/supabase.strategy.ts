import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase;

  public constructor(private configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = configService.get<string>('SUPABASE_KEY') || '';
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET') || '';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use JWT secret if available, otherwise skip verification (for testing)
      secretOrKey: jwtSecret || supabaseKey, // Fallback to anon key if no secret
      passReqToCallback: false,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async validate(payload: any): Promise<any> {
    // Payload is already verified by JWT strategy
    // Just extract user info from payload
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub, // Supabase user ID
      email: payload.email || '',
      user_metadata: payload.user_metadata || {},
    };
  }
}

