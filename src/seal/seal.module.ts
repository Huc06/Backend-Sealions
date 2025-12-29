import { Module } from '@nestjs/common';
import { SealEncryptionService } from './seal-encryption.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SealEncryptionService],
  exports: [SealEncryptionService],
})
export class SealModule {}

