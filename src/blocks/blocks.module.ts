import { Module, forwardRef } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { SharingModule } from '../sharing/sharing.module';
import { CollaborationModule } from '../collaboration/collaboration.module';

@Module({
  imports: [SharingModule, forwardRef(() => CollaborationModule)],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}

