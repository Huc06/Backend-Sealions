import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { PagesModule } from './pages/pages.module';
import { BlocksModule } from './blocks/blocks.module';
import { StorageModule } from './storage/storage.module';
import { TagsModule } from './tags/tags.module';
import { SharingModule } from './sharing/sharing.module';
import { CommentsModule } from './comments/comments.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { WalrusModule } from './walrus/walrus.module';
import { SealModule } from './seal/seal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    PagesModule,
    BlocksModule,
    StorageModule,
    TagsModule,
    SharingModule,
    CommentsModule,
    CollaborationModule,
    WalrusModule,
    SealModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
