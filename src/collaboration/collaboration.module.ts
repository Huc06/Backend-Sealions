import { Module, forwardRef } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SharingModule } from '../sharing/sharing.module';

@Module({
  imports: [JwtModule, ConfigModule, PrismaModule, SharingModule],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}

