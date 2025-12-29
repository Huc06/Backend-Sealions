import { Module } from '@nestjs/common';
import { WalrusPricingService } from './walrus-pricing.service';
import { WalrusPricingController } from './walrus-pricing.controller';
import { WalrusStorageService } from './walrus-storage.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [WalrusPricingController],
  providers: [WalrusPricingService, WalrusStorageService],
  exports: [WalrusPricingService, WalrusStorageService],
})
export class WalrusModule {}

