import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsString } from 'class-validator';

export enum BlockType {
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  CHECKLIST = 'CHECKLIST',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
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
    examples: {
      TEXT: { value: { text: 'Hello World', bold: false } },
      HEADING: { value: { text: 'My Heading', level: 1 } },
      CHECKLIST: { value: { items: [{ text: 'Task 1', checked: false }] } },
      IMAGE: { value: { url: 'https://example.com/image.jpg', caption: 'My image' } },
      FILE: { value: { url: 'https://res.cloudinary.com/cloud/image/upload/v123/file.pdf', name: 'document.pdf', type: 'pdf', size: 1024000 } },
    },
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

