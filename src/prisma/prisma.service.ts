import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      // Don't throw - allow app to start and retry later
      // In production, you might want to retry with exponential backoff
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

