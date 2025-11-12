import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePageDto {
  @ApiProperty({
    description: 'Updated page title',
    example: 'Updated Meeting Notes',
  })
  @IsString()
  title: string;
}

