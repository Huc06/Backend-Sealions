import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { SharingModule } from '../sharing/sharing.module';
import { WalrusModule } from '../walrus/walrus.module';
import { SealModule } from '../seal/seal.module';

@Module({
  imports: [SharingModule, WalrusModule, SealModule],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}

