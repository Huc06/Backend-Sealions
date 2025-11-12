import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsString } from 'class-validator';

export enum BlockType {
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  CHECKLIST = 'CHECKLIST',
  IMAGE = 'IMAGE',
}

export class CreateBlockDto {
  @ApiProperty({
    enum: BlockType,
    enumName: 'BlockType',
    description: 'Type of block to create',
    example: BlockType.TEXT,
  })
  @IsEnum(BlockType)
  type: BlockType;

  @ApiProperty({
    description: 'Content payload for the block (structure depends on block type)',
    example: { text: 'Hello World', bold: false },
  })
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @ApiProperty({
    description: 'Parent page ID',
    example: 'cmhvq1234000012gmbwreufjj4',
  })
  @IsString()
  pageId: string;

  @ApiProperty({
    description: 'Position of the block within the page',
    example: 0,
  })
  @IsInt()
  position: number;
}

