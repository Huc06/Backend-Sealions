import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseStrategy } from './strategies/supabase.strategy';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy],
  exports: [AuthService, SupabaseStrategy],
})
export class AuthModule {}

