import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { SharingModule } from '../sharing/sharing.module';

@Module({
  imports: [SharingModule],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}

