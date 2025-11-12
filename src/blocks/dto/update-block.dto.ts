import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { BlockType } from './create-block.dto';

export class UpdateBlockDto {
  @ApiPropertyOptional({
    enum: BlockType,
    description: 'Updated block type',
    example: BlockType.TEXT,
  })
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @ApiPropertyOptional({
    description: 'Updated content payload for the block',
    example: { text: 'Updated Text', bold: true },
  })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}

