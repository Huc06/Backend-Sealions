import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { PasswordReminderService } from './password-reminder.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PassportModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy, PasswordReminderService],
  exports: [AuthService, SupabaseStrategy, PasswordReminderService],
})
export class AuthModule {}

