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
    description: `
Content payload for the block. Structure depends on block type:

**TEXT**: \`{ text: string, bold?: boolean, italic?: boolean, underline?: boolean }\`
- Example: \`{ text: "Hello World", bold: false }\`

**HEADING**: \`{ text: string, level: 1 | 2 | 3 }\`
- Example: \`{ text: "My Heading", level: 1 }\`

**CHECKLIST**: \`{ items: Array<{ text: string, checked: boolean }> }\`
- Example: \`{ items: [{ text: "Task 1", checked: false }, { text: "Task 2", checked: true }] }\`

**IMAGE**: \`{ url: string, caption?: string, alt?: string }\`
- Example: \`{ url: "https://example.com/image.jpg", caption: "My image" }\`

**FILE**: \`{ url: string, name: string, type: string, size: number }\`
- Example: \`{ url: "https://res.cloudinary.com/.../file.pdf", name: "document.pdf", type: "pdf", size: 1024000 }\`
    `,
    examples: {
      TEXT: {
        summary: 'Text Block Content',
        value: { text: 'Hello World', bold: false, italic: false, underline: false },
      },
      HEADING: {
        summary: 'Heading Block Content',
        value: { text: 'My Heading', level: 1 },
      },
      CHECKLIST: {
        summary: 'Checklist Block Content',
        value: {
          items: [
            { text: 'Task 1', checked: false },
            { text: 'Task 2', checked: true },
            { text: 'Task 3', checked: false },
          ],
        },
      },
      IMAGE: {
        summary: 'Image Block Content',
        value: {
          url: 'https://example.com/image.jpg',
          caption: 'My beautiful image',
          alt: 'Image description',
        },
      },
      FILE: {
        summary: 'File Block Content',
        value: {
          url: 'https://res.cloudinary.com/cloud/image/upload/v123/file.pdf',
          name: 'document.pdf',
          type: 'pdf',
          size: 1024000,
        },
      },
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

