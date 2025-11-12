import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { BlockType } from './create-block.dto';

export class UpdateBlockDto {
  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}

