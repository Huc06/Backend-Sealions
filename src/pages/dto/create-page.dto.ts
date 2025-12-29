import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum PageMode {
  TRADITIONAL = 'TRADITIONAL',
  SECURE = 'SECURE',
}

export class CreatePageDto {
  @ApiPropertyOptional({
    description: 'Title of the new page',
    example: 'Meeting Notes',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Storage mode: TRADITIONAL (default, centralized) or SECURE (encrypted, decentralized)',
    enum: PageMode,
    example: PageMode.TRADITIONAL,
  })
  @IsOptional()
  @IsEnum(PageMode)
  mode?: PageMode;
}

