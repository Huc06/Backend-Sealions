import { IsEnum, IsInt, IsNotEmpty, IsObject, IsString } from 'class-validator';

export enum BlockType {
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  CHECKLIST = 'CHECKLIST',
  IMAGE = 'IMAGE',
}

export class CreateBlockDto {
  @IsEnum(BlockType)
  type: BlockType;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @IsString()
  pageId: string;

  @IsInt()
  position: number;
}

